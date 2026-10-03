# Monitoring

## Endpoints

- `GET /health` is liveness only and returns 200 while the process is serving.
- `GET /ready` is the traffic-readiness signal. It returns 200 normally and 503 if `SIMULATE_FAILURE=true`.
- `GET /metrics` serves live Prometheus text-format metrics from `prom-client`: default Node.js process metrics, request totals, request-duration histogram, and HTTP error totals.

This service currently has no external dependencies to probe. The `SIMULATE_FAILURE` flag models dependency unavailability for a controlled drill; it does not test an actual database or network service.

## Logs

Production logs are structured JSON and include service/environment metadata, request ID, method, matched route, status, and duration. Request headers and request bodies are not logged. Production error responses are generic; detailed exception messages and stacks are limited to non-production logs. Avoid adding credentials or sensitive data to log messages.

## Operational checks

During local/CI checks, query `/health`, `/ready`, and `/metrics`. For the planned Render demonstration, follow [INCIDENT.md](INCIDENT.md); it has not yet happened. Investigate Render deploy and runtime logs when startup or health checks fail.
