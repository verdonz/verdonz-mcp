import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { MockClient } from '../src/client/mock-client.js';
import { ask } from '../src/tools/ask.js';
import { getEvidence } from '../src/tools/get-evidence.js';
import { getMetric } from '../src/tools/get-metric.js';
import { investigate } from '../src/tools/investigate.js';
import { listDatasets } from '../src/tools/list-datasets.js';
import { listMetrics } from '../src/tools/list-metrics.js';
import { createServer } from '../src/server.js';

describe('configuration', () => {
  it('requires production credentials', () => expect(() => loadConfig({ VERDONZ_MOCK: 'false' })).toThrow(/API_KEY/));
  it('accepts mock mode without credentials', () => expect(loadConfig({ VERDONZ_MOCK: 'true' })).toEqual({ mock: true }));
});

describe('mock tools', () => {
  const client = new MockClient();
  it('initializes an MCP server', () => expect(createServer({ mock: true })).toBeDefined());
  it('validates list metrics input and returns metrics', async () => { await expect(listMetrics(client, { limit: 2 })).resolves.toHaveLength(2); await expect(listMetrics(client, { limit: 0 })).rejects.toThrow(); });
  it('gets a metric', async () => { await expect(getMetric(client, { name: 'revenue' })).resolves.toMatchObject({ id: 'revenue' }); await expect(getMetric(client, {})).rejects.toThrow(); });
  it('lists datasets', async () => { await expect(listDatasets(client, { search: 'commerce' })).resolves.toHaveLength(1); });
  it('answers questions', async () => { await expect(ask(client, { question: 'What changed?' })).resolves.toMatchObject({ answer: expect.stringContaining('demo') }); });
  it('investigates metrics', async () => { await expect(investigate(client, { metric: 'revenue' })).resolves.toMatchObject({ metric: 'revenue', evidence: expect.any(Array) }); });
  it('returns evidence', async () => { await expect(getEvidence(client, { resultId: 'r1' })).resolves.toHaveLength(1); });
  it('handles missing resources', async () => { await expect(getMetric(client, { name: 'missing' })).rejects.toMatchObject({ code: 'NOT_FOUND' }); });
});
