# Security

Report suspected vulnerabilities privately through the repository’s GitHub security contact rather than a public issue.

- Provide API keys only through environment variables.
- Never commit credentials, authorization headers, or `.env` files.
- Use the minimum Verdonz permissions needed for the client.
- The server only limits transport; the underlying Verdonz identity must enforce data authorization.
- Diagnostic logs go to stderr and do not include API keys, headers, or sensitive result payloads by default.
