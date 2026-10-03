# Scaling

The service is stateless and stores no durable data, so multiple instances can serve requests without session affinity. Render's service plan and concurrency limits determine practical capacity; measure real traffic before changing instance size or count.

The process exposes default Node.js metrics and HTTP count/latency/error metrics. It has no queue, database pool, cache, or background worker to scale independently. Local container storage is ephemeral and must not be used for persistent user data. `GET /metrics` is unauthenticated in this demonstration service; before exposing sensitive operational telemetry in a larger system, restrict access at the platform/network layer.
