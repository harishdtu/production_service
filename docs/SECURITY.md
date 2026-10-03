# Security notes

- `.env` and `.env.*` files are excluded from Git; `.env.example` contains non-secret defaults only.
- The Docker build context excludes environment files (except the harmless sample) and the image does not copy an env file.
- The app runs as a non-root user in the runtime image and disables Express's `X-Powered-By` header.
- Production errors return generic messages. Request IDs are generated before body parsing so parser errors also have an ID.
- Logs omit request headers, query strings, and request bodies. Metrics use route templates or a fixed `unmatched` label to limit sensitive data and cardinality.
- No credentials or external dependency URLs are currently required. Add future secrets only through Render/GitHub secret settings, never source control.

Before publishing, inspect repository status and diffs, scan for credential patterns without printing secret values, and ensure `.env` is ignored.
