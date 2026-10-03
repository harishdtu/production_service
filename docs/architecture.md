# Architecture

```text
HTTP client / Render router
          |
          v
Node.js 22 process (src/server.js binds 0.0.0.0:$PORT)
          |
          v
Express app (src/app.js)
  | health/readiness/version routes
  | request IDs, structured completion logs, errors
  | live Prometheus metrics (src/metrics.js)
          |
          v
No database, queue, or upstream service dependencies
```

## Request flow

1. The app assigns a request ID before parsing a JSON body and returns it in `X-Request-Id`.
2. Express routes the request. Completion middleware records method, matched route (or fixed `unmatched`), status, and elapsed time.
3. The logger emits structured production logs without request headers, query strings, or bodies.
4. Errors are returned as structured JSON; production messages do not include parser or exception details.

## Health semantics

`/health` signals process liveness and does not depend on integrations. `/ready` signals readiness. Since this app has no external dependencies, `SIMULATE_FAILURE=true` models an unavailable dependency and returns 503; it is a demonstration switch, not a real connectivity probe.

The process is stateless, runs in a non-root Docker container, and handles SIGINT/SIGTERM with a bounded graceful shutdown. It has no custom application timeout because it performs no outbound calls; introduce one alongside any future long-running operation.
