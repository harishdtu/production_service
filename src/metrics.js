const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'production_service_',
});

const httpRequestsTotal = new client.Counter({
  name: 'production_service_http_requests_total',
  help: 'Total number of HTTP requests.',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestDurationMs = new client.Histogram({
  name: 'production_service_http_request_duration_ms',
  help: 'HTTP request latency in milliseconds.',
  labelNames: ['method', 'route', 'status'],
  buckets: [25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [register],
});

const httpErrorsTotal = new client.Counter({
  name: 'production_service_http_errors_total',
  help: 'Total number of HTTP errors.',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDurationMs,
  httpErrorsTotal,
};
