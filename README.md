# Production Service

A small stateless Node.js 22 and Express service for demonstrating practical operations: structured logs, request IDs, health and readiness endpoints, Prometheus metrics, graceful shutdown, a non-root Docker image, and GitHub Actions CI.

## Architecture

The service has no database or upstream service dependencies. `src/app.js` defines the HTTP routes and error handling; `src/server.js` starts the listener on `0.0.0.0` using `PORT`; configuration and logging are centralized in `src/config.js` and `src/logger.js`. See [architecture](docs/architecture.md) for request flow and boundaries.

## Local setup

```sh
npm ci
cp .env.example .env
npm start
```

On Windows PowerShell, copy the sample with `Copy-Item .env.example .env`. The app listens on port 3000 by default. Run checks with `npm test`, `npm run lint`, and `npm run build`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Selects production-safe JSON logs and generic error responses when set to `production`. |
| `PORT` | `3000` | HTTP listen port; Render supplies this at runtime. |
| `SERVICE_NAME` | `production-service` | Service name included in logs and health output; cannot be blank. |
| `LOG_LEVEL` | `info` | Winston log threshold. |
| `SIMULATE_FAILURE` | `false` | When `true`, makes `/ready` return 503 for the planned failure drill. |

There are no credentials or external dependency URLs required by this service. Keep `.env` and all real credentials out of Git.

## HTTP endpoints

- `GET /health`: liveness only; returns 200 while the process can serve requests.
- `GET /ready`: readiness; returns 200 normally and 503 when failure simulation is enabled. No external dependencies currently exist, so the switch is an operational simulation, not a real dependency probe.
- `GET /metrics`: live Prometheus process and HTTP request counters/histograms.
- `GET /version`: service version and optional `GIT_SHA`.

## Docker

```sh
docker build -t production-service:local .
docker run --rm -p 3000:3000 production-service:local
```

The image uses Node Alpine, production dependencies, a non-root user, and a Docker health check. No `.env` file is copied into it. Compose is available with `docker compose up --build`.

## CI and deployment

GitHub Actions in `.github/workflows/ci.yml` install dependencies, run lint/tests/build validation, build the image, and smoke-check health/readiness/metrics plus restart behavior. There is no GitHub deploy workflow. Render deployment is a separate Git-connected service configured by [`render.yaml`](render.yaml); after setup, Render can deploy the linked branch only after GitHub checks pass. See [CI/CD](docs/CI_CD.md) and [deployment](docs/DEPLOYMENT.md).

## Failure handling, rollback, and operations

Use [monitoring](docs/MONITORING.md), the [runbook](docs/RUNBOOK.md), and the [planned incident procedure](docs/INCIDENT.md) for checks and the controlled readiness-failure demonstration. The procedure has not been performed. Render rollback steps are in [deployment](docs/DEPLOYMENT.md). Scaling limits and deliberate trade-offs are documented in [SCALING](docs/SCALING.md) and [TRADEOFFS](docs/TRADEOFFS.md).
