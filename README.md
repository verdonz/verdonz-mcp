# Verdonz MCP

Connect AI assistants to governed business data with Verdonz.

Verdonz MCP is an open-source [Model Context Protocol](https://modelcontextprotocol.io/) server that lets compatible AI clients work with governed metrics, datasets, investigations, and supporting evidence through [Verdonz](https://www.verdonz.com). It runs over stdio and keeps stdout reserved for MCP protocol traffic.

## What is Verdonz MCP?

It is a small Node.js server that translates MCP tool calls into governed Verdonz API requests. The underlying Verdonz identity remains the authority for access, permissions, and data visibility.

## Why use it?

- Give AI assistants a governed path to business data.
- Keep metric definitions and source context close to answers.
- Use the same tool surface locally with fictional demo data.

## Features

Six tools cover metric discovery, dataset discovery, questions, investigations, and evidence. Production capabilities depend on the connected Verdonz API contract and permissions.

## Installation

```sh
npm install -g @verdonz/mcp
npx @verdonz/mcp
```

## Quick start

```sh
export VERDONZ_API_KEY="your-key"
export VERDONZ_BASE_URL="https://your-verdonz-api.example"
npx @verdonz/mcp
```

`VERDONZ_BASE_URL` is required in production mode; this package does not invent a default host.

## MCP client configuration

```json
{
  "mcpServers": {
    "verdonz": {
      "command": "npx",
      "args": ["-y", "@verdonz/mcp"],
      "env": {
        "VERDONZ_API_KEY": "YOUR_API_KEY",
        "VERDONZ_BASE_URL": "YOUR_VERDONZ_API_URL"
      }
    }
  }
}
```

## Available tools

- `verdonz_list_metrics` — search accessible governed metrics.
- `verdonz_get_metric` — retrieve a metric definition and metadata.
- `verdonz_list_datasets` — list accessible data sources.
- `verdonz_ask` — ask a governed business question.
- `verdonz_investigate` — investigate metric movement when supported by the provider.
- `verdonz_get_evidence` — retrieve source/lineage evidence when supported.

## Example questions

“What changed in revenue last month?” “Which region contributed most to the decline?” “Show me the definition of net revenue.” “What datasets can I access?” “Investigate the drop in conversion rate.” “What evidence supports that conclusion?” Actual capabilities depend on the connected Verdonz environment.

## Mock/demo mode

Run `VERDONZ_MOCK=true npx @verdonz/mcp` to use fictional revenue, conversion rate, active customer, region, and product data without a network connection. No real customer data is included.

## Authentication

Set `VERDONZ_API_KEY` and `VERDONZ_BASE_URL` as environment variables. The production adapter sends the key as `X-Verdonz-API-Key` and never logs it.

## Architecture

The MCP transport and tool schemas are isolated from a typed `VerdonzClient` interface. `MockClient` supplies the local demo; `VerdonzApiClient` maps confirmed semantic HTTP routes; future API changes stay behind that adapter.

## Security

Read [SECURITY.md](SECURITY.md). Use least-privilege keys, keep credentials out of source control, and remember that the MCP server can expose whatever the configured Verdonz identity can access.

## Development

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

See [docs/VERDONZ_API_INTEGRATION.md](docs/VERDONZ_API_INTEGRATION.md) for adapter details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Roadmap

Validate the production API gateway contract, add a first-class investigation adapter, expand evidence normalization, and add integration tests against a safe Verdonz environment.

## License

MIT. See [LICENSE](LICENSE).

## About Verdonz

[Verdonz](https://www.verdonz.com) builds governed AI agents for your business. It connects business data and context so teams and AI can ask questions, understand what changed, and investigate the evidence behind an answer.
