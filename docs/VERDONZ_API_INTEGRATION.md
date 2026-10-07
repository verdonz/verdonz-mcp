# Verdonz API integration

The adapter uses contracts found in the nearby Verdonz server/webapp repositories. Confirmed routes are:

- `POST /api/datasources/get` to list configured data sources.
- `GET /api/semantic/{datasourceId}/metrics` for metric definitions.
- `GET /api/semantic/{datasourceId}/metadata` for semantic metadata.
- `POST /api/semantic/{datasourceId}/nl-query` for governed natural-language queries.
- `GET /api/semantic/{datasourceId}/lineage?kind=metric&name=...` for lineage evidence.

Authentication is the `X-Verdonz-API-Key` header. The client requires `VERDONZ_BASE_URL`; it intentionally does not assume a production host.

The six npm tools are mapped onto those capabilities. A dedicated investigation endpoint was not found in the available contract, so `verdonz_investigate` is implemented in mock mode and returns a typed `UNSUPPORTED_CAPABILITY` error in production mode. A future adapter can implement it without changing MCP tool schemas. Production `ask` also requires a `datasetId` because the current semantic routes are datasource-scoped.

Remaining integration work: confirm the production API gateway URL, the exact datasource-list response for all deployments, whether NL-query returns first-class evidence, and the intended investigation endpoint/result shape. Add contract tests against a non-production Verdonz environment before enabling additional capabilities.
