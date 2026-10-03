# Design trade-offs

- **Small Express app:** keeps the example easy to run and inspect; it does not include domain logic or external integrations.
- **No database or upstream dependency:** avoids fictional infrastructure. `/ready` demonstrates the contract, while `SIMULATE_FAILURE` provides a reversible configuration-driven drill rather than a real dependency probe.
- **Prometheus endpoint in-process:** uses `prom-client` and real process/request observations without requiring a monitoring stack. The endpoint is open and should be access-restricted if metrics become sensitive.
- **Docker on Render:** gives a reproducible runtime and non-root image. Render Git integration owns deploy execution; GitHub Actions runs CI only.
- **Dashboard rollback:** avoids credentials and provider API automation in this small repository. Rollback availability depends on Render's retained build artifacts.
- **No custom request timeout:** the app has no outbound calls or long-running business handlers that need an application timeout. Add explicit timeouts when such work is introduced.
