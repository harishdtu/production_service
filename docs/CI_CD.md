# CI and deployment

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. It uses Node.js 22 and `npm ci`, then runs lint, tests, and build validation. It builds the Docker image and checks `/health`, `/ready`, and `/metrics`, restarts the container, and checks `/health` again. GitHub Actions does not deploy the service.

## Render delivery

The Blueprint in `render.yaml` describes a Git-backed Docker web service with `/health` as its health-check path. Connect the GitHub repository to Render and configure the service to deploy after CI checks pass. Render performs the actual build and deployment from the connected branch; no Render API key, service ID, or deploy hook is stored here. See [Render deployment](DEPLOYMENT.md).

## Required secrets

None for CI or for the current app. If future integrations need credentials, configure them in the hosting platform or GitHub Actions secrets, and add only secret *names* with `sync: false` to a Blueprint when needed.
