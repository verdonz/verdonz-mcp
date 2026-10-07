import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Config } from './config.js';
import { VerdonzApiClient } from './client/verdonz-client.js';
import { MockClient } from './client/mock-client.js';
import type { VerdonzClient } from './client/types.js';
import { toSafeError } from './utils/errors.js';
import { ask } from './tools/ask.js';
import { getEvidence } from './tools/get-evidence.js';
import { getMetric } from './tools/get-metric.js';
import { investigate } from './tools/investigate.js';
import { listDatasets } from './tools/list-datasets.js';
import { listMetrics } from './tools/list-metrics.js';

export function createClient(config: Config): VerdonzClient { return config.mock ? new MockClient() : new VerdonzApiClient(config.baseUrl!, config.apiKey!); }

const toolDefinitions = [
  { name: 'verdonz_list_metrics', description: 'List governed metric definitions the identity can access.', inputSchema: { type: 'object', properties: { search: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 100 }, datasetId: { type: 'string', description: 'Optional Verdonz datasource id.' } } } },
  { name: 'verdonz_get_metric', description: 'Get the definition and metadata for a governed metric.', inputSchema: { type: 'object', properties: { metricId: { type: 'string' }, name: { type: 'string' }, datasetId: { type: 'string' } } } },
  { name: 'verdonz_list_datasets', description: 'List governed datasets/data sources available to the identity.', inputSchema: { type: 'object', properties: { search: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 100 } } } },
  { name: 'verdonz_ask', description: 'Ask a business question through Verdonz governed semantic data.', inputSchema: { type: 'object', properties: { question: { type: 'string' }, datasetId: { type: 'string' }, context: { type: 'string' }, timeRange: { type: 'object' } }, required: ['question'] } },
  { name: 'verdonz_investigate', description: 'Investigate why a governed metric changed. Production availability depends on the connected Verdonz API.', inputSchema: { type: 'object', properties: { metric: { type: 'string' }, datasetId: { type: 'string' }, timeRange: { type: 'object' }, comparisonPeriod: { type: 'object' }, dimensions: { type: 'array', items: { type: 'string' } } }, required: ['metric'] } },
  { name: 'verdonz_get_evidence', description: 'Retrieve source/lineage evidence for a Verdonz result when supported.', inputSchema: { type: 'object', properties: { resultId: { type: 'string' }, metric: { type: 'string' }, datasetId: { type: 'string' } } } },
];

export function createServer(config: Config): Server {
  const server = new Server({ name: 'verdonz-mcp', version: '0.1.0' }, { capabilities: { tools: {} } });
  const client = createClient(config);
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: toolDefinitions }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const input = request.params.arguments ?? {};
      const result = await ({
        verdonz_list_metrics: () => listMetrics(client, input),
        verdonz_get_metric: () => getMetric(client, input),
        verdonz_list_datasets: () => listDatasets(client, input),
        verdonz_ask: () => ask(client, input),
        verdonz_investigate: () => investigate(client, input),
        verdonz_get_evidence: () => getEvidence(client, input),
      } as Record<string, () => Promise<unknown>>)[request.params.name]?.();
      if (result === undefined) return { content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }], isError: true };
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], structuredContent: result };
    } catch (error) {
      const safe = toSafeError(error);
      return { content: [{ type: 'text', text: JSON.stringify({ error: safe.message, code: safe.code }) }], isError: true };
    }
  });
  return server;
}
