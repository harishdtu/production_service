# Operations runbook

## Routine checks

1. Check the Render deploy state and recent logs.
2. Request `/health` for process liveness and `/ready` for traffic readiness.
3. Request `/metrics` when investigating request volume, HTTP errors, latency, or process behavior.
4. Confirm `SIMULATE_FAILURE=false` after any controlled readiness drill.

## Readiness returns 503

This service has no external dependencies. Check the deployment environment for `SIMULATE_FAILURE=true`; if that was intentional, follow [INCIDENT.md](INCIDENT.md). If not, correct it to `false` in Render and allow the service to restart, then confirm `/health` and `/ready` both return 200. Inspect logs for `readiness_failure_injected` without copying sensitive deployment values into tickets or chat.

## Startup or health check fails

Review the Render build and runtime logs, verify the app binds to Render's injected `PORT`, and confirm the health check path is `/health`. Test the corresponding commit locally with `npm ci`, lint, tests, build, and Docker validation before retrying deployment.

## Rollback

Use Render Dashboard Deploys to roll back to the latest known-good successful deploy. Verify both health endpoints afterward. Dashboard rollback disables auto-deploys; re-enable them after a fix is ready. See [DEPLOYMENT.md](DEPLOYMENT.md).
