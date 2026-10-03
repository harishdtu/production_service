# Planned production failure demonstration

**Status: Planned production failure demonstration. This procedure has not been performed.**

## Purpose and safety

Demonstrate a reversible readiness failure while preserving liveness. This service has no external dependency, so the `SIMULATE_FAILURE` environment flag models a dependency/configuration failure without damaging data or changing application code. Perform this only on the intended Render demo service, during a period when a temporary unhealthy readiness state is acceptable.

## Procedure

1. Deploy a healthy baseline and record its Render deploy identifier as v1. Confirm `/health` and `/ready` return HTTP 200.
2. In the Render service environment, change `SIMULATE_FAILURE` from `false` to `true` and save. Render restarts/redeploys the service with the changed environment.
3. Observe `/health` returning HTTP 200 and `/ready` returning HTTP 503 with `checks.dependencies` set to `unavailable`. Render's configured health check is `/health`, so Render can still consider this deployment healthy; detect the drill through the readiness request and application logs, then choose rollback manually.
4. Review logs for `readiness_failure_injected`. The log identifies the flag only; do not share secret environment values.
5. Capture the intentionally degraded version/deploy identifier as v2 for the demonstration. Do not describe it as a Render health-check failure or a real upstream outage.
6. For the rollback demonstration, use Render Deploys to roll back to the known-good v1 and verify `/health` and `/ready` return 200.
7. If rollback does not restore the desired environment, set `SIMULATE_FAILURE=false`, save, and verify both endpoints again.
8. Dashboard rollback may disable auto-deploys. Re-enable auto-deploys only after confirming the service is healthy and the desired commit is selected.

## Recovery and evidence

Recovery is complete when both health endpoints return 200 and Render shows the expected healthy deploy. Keep the deploy identifiers, timestamps, endpoint status codes, and redacted log excerpts. Do not claim this incident or rollback occurred until the demonstration is actually run.
