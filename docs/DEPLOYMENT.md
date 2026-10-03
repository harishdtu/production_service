# Render deployment

## Current state

This repository is prepared for a Render Git-backed Docker web service. It has not been deployed, and there is no Render URL yet. The app has no external services or credentials to configure.

## Create the Render service

1. Push the finalized repository to GitHub and confirm the `main` branch CI workflow passes.
2. In Render, create a Blueprint instance from the repository or create a Docker Web Service connected to it.
3. Review `render.yaml`: it names the web service, selects the Docker runtime and Dockerfile, waits for CI checks before auto-deploying, and uses `/health` for Render's health checks.
4. Keep `SIMULATE_FAILURE=false` for normal operation. Render injects `PORT`; do not hard-code a different value.
5. Confirm the first deployment succeeds. From the service URL, check `/health`, `/ready`, and `/metrics`.

Render configuration is defined in [`render.yaml`](../render.yaml). Current configuration documentation is in the [Blueprint specification](https://render.com/docs/blueprint-spec), [deploys guide](https://render.com/docs/deploys), and [health checks guide](https://render.com/docs/health-checks).

## Rollback

For a bad deployment, open the service's Deploys page in the Render Dashboard, select a recent successful deploy, and choose **Rollback**. Confirm `/health` and `/ready` return 200 and inspect the logs. Render's dashboard rollback disables auto-deploys as a safeguard; after fixing the issue, review the service and explicitly re-enable auto-deploys in Settings. Render retains only a limited number of build artifacts depending on plan, so rollback availability is not permanent. See [Render rollback documentation](https://render.com/docs/rollbacks).

The intended later demonstration is healthy v1, intentionally degraded v2, then dashboard rollback to v1. That sequence has not been run.
