const request = require('supertest');
const { createApp } = require('../src/app');

describe('production service', () => {
  let app;

  beforeEach(() => {
    app = createApp({ env: 'test', simulateFailure: false });
  });

  it('returns health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns readiness when dependencies are okay', async () => {
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ready');
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/missing-route');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('returns a degraded readiness when failure is simulated', async () => {
    const appWithFailure = createApp({ env: 'test', simulateFailure: true });
    const response = await request(appWithFailure).get('/ready');
    expect(response.status).toBe(503);
    expect(response.body.status).toBe('not_ready');
    expect(response.body.checks.dependencies).toBe('unavailable');
  });

  it('does not expose parser details in production errors', async () => {
    const productionApp = createApp({ env: 'production' });
    const response = await request(productionApp).post('/').set('Content-Type', 'application/json').send('{invalid json');
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Invalid request.');
    expect(response.body.error.request_id).toBeTruthy();
  });

  it('exposes live Prometheus request metrics', async () => {
    await request(app).get('/health');
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/plain/);
    expect(response.text).toContain('production_service_http_requests_total');
    expect(response.text).toContain('production_service_http_request_duration_ms');
  });
});
