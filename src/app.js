const crypto = require('crypto');
const express = require('express');
const config = require('./config');
const logger = require('./logger');
const { register, httpRequestsTotal, httpRequestDurationMs, httpErrorsTotal } = require('./metrics');

const createApp = (overrides = {}) => {
  const appConfig = { ...config, ...overrides };
  const app = express();

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    req.requestId = req.get('x-request-id') || crypto.randomUUID();
    res.setHeader('x-request-id', req.requestId);
    res.locals.requestId = req.requestId;
    next();
  });
  app.use(express.json({ limit: '1mb' }));

  app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const durationMs = Date.now() - startTime;
      const route = req.route ? req.route.path : 'unmatched';
      const status = res.statusCode;

      httpRequestsTotal.inc({ method: req.method, route, status: String(status) });
      httpRequestDurationMs.observe({ method: req.method, route, status: String(status) }, durationMs);

      if (status >= 400) {
        httpErrorsTotal.inc({ method: req.method, route, status: String(status) });
      }

      logger.info('request_completed', {
        request_id: req.requestId,
        method: req.method,
        status,
        duration_ms: durationMs,
      });
    });

    next();
  });

  app.get('/', (req, res) => {
    res.json({
      service: appConfig.serviceName,
      status: 'ok',
      environment: appConfig.env,
      uptime_seconds: process.uptime(),
    });
  });

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: appConfig.serviceName,
      environment: appConfig.env,
      uptime_seconds: Number(process.uptime().toFixed(3)),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/ready', (req, res) => {
    const checks = {
      process: 'ok',
      dependencies: appConfig.simulateFailure ? 'unavailable' : 'ok',
    };

    if (appConfig.simulateFailure) {
      logger.error('readiness_failure_injected', { request_id: req.requestId, reason: 'SIMULATE_FAILURE=true' });
      return res.status(503).json({
        status: 'not_ready',
        checks,
        error: 'Service intentionally degraded for failure simulation.',
      });
    }

    return res.status(200).json({
      status: 'ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  });

  app.get('/version', (req, res) => {
    res.json({
      version: process.env.npm_package_version || '1.0.0',
      commit: process.env.GIT_SHA || 'local',
      service: appConfig.serviceName,
    });
  });

  app.use((req, res, next) => {
    const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    next(err);
  });

  app.use((err, req, res, _next) => {
    const status = Number.isInteger(err.statusCode) && err.statusCode >= 400 && err.statusCode <= 599
      ? err.statusCode
      : 500;
    const isProd = appConfig.env === 'production';
    const safeMessage = status === 404 ? 'Not found.' : status < 500 ? 'Invalid request.' : 'An unexpected error occurred.';

    if (status >= 500) {
      logger.error('unhandled_error', {
        request_id: req.requestId,
        status,
        message: isProd ? 'An unexpected error occurred.' : err.message,
        stack: isProd ? undefined : err.stack,
        path: req.path,
      });
    } else {
      logger.warn('client_error', {
        request_id: req.requestId,
        status,
        message: isProd ? safeMessage : err.message,
        path: req.path,
      });
    }

    res.status(status).json({
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: isProd ? safeMessage : err.message,
        request_id: req.requestId,
      },
    });
  });

  return app;
};

const startServer = (port = config.port) => {
  const app = createApp();
  const server = app.listen(port, '0.0.0.0', () => {
    logger.info('server_started', {
      port,
      node_env: config.env,
      service: config.serviceName,
    });
  });

  let isShuttingDown = false;
  const shutdown = (signal) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;
    logger.warn('shutdown_started', { signal, service: config.serviceName });

    server.close(() => {
      logger.info('server_closed', { service: config.serviceName });
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('shutdown_timeout_reached', { service: config.serviceName });
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  return server;
};

module.exports = { createApp, startServer };
