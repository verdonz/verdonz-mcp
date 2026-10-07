import type { AskInput, Dataset, Evidence, EvidenceInput, InvestigateInput, InvestigationResult, Metric, QueryResult, VerdonzClient } from './types.js';
import { VerdonzError } from '../utils/errors.js';

type ApiMetric = { name: string; label?: string; description?: string; synonyms?: string[]; type?: string; grain?: string; entity?: string; agg?: string; meta?: Record<string, string>; guardrails?: Record<string, unknown> };
type ApiDataset = { uid?: string; id?: string; name?: string; type?: string; typeName?: string; url?: string; description?: string };

export class VerdonzApiClient implements VerdonzClient {
  constructor(private readonly baseUrl: string, private readonly apiKey: string, private readonly fetchImpl: typeof fetch = fetch) {}
  private path(datasetId: string, suffix: string): string { return `${this.baseUrl}/api/semantic/${encodeURIComponent(datasetId)}${suffix}`; }
  private async request<T>(url: string, init: RequestInit = {}): Promise<T> {
    let response: Response;
    try { response = await this.fetchImpl(url, { ...init, headers: { accept: 'application/json', 'content-type': 'application/json', 'X-Verdonz-API-Key': this.apiKey, ...init.headers } }); }
    catch { throw new VerdonzError('Could not reach the Verdonz API.', 'NETWORK_ERROR'); }
    if (!response.ok) {
      if (response.status === 401) throw new VerdonzError('Verdonz authentication failed.', 'AUTHENTICATION_ERROR', 401);
      if (response.status === 403) throw new VerdonzError('The Verdonz identity is not permitted to access this resource.', 'PERMISSION_ERROR', 403);
      if (response.status === 404) throw new VerdonzError('The requested Verdonz resource was not found.', 'NOT_FOUND', 404);
      if (response.status === 429) throw new VerdonzError('Verdonz rate limit reached. Try again later.', 'RATE_LIMITED', 429);
      throw new VerdonzError(`Verdonz API request failed with HTTP ${response.status}.`, 'UPSTREAM_ERROR', response.status);
    }
    return await response.json() as T;
  }
  private metric(datasetId: string, item: ApiMetric): Metric { return { id: item.name, name: item.name, label: item.label, description: item.description, definition: item.meta?.definition, dimensions: item.meta?.dimensions?.split(',').map((v) => v.trim()).filter(Boolean), source: item.entity, synonyms: item.synonyms, type: item.type, grain: item.grain, aggregation: item.agg, guardrails: item.guardrails }; }
  async listDatasets(input: { search?: string; limit?: number }): Promise<Dataset[]> {
    const body = await this.request<{ datasources?: ApiDataset[]; dataSources?: ApiDataset[] }>(`${this.baseUrl}/api/datasources/get`, { method: 'POST', body: JSON.stringify({}) });
    return (body.datasources ?? body.dataSources ?? []).map((d) => ({ id: d.uid ?? d.id ?? d.name ?? '', name: d.name ?? d.uid ?? d.id ?? 'Unnamed datasource', type: d.typeName ?? d.type, description: d.description })).filter((d) => !input.search || `${d.name} ${d.id}`.toLowerCase().includes(input.search.toLowerCase())).slice(0, input.limit ?? 50);
  }
  async listMetrics(input: { search?: string; limit?: number; datasetId?: string }): Promise<Metric[]> {
    const datasets = input.datasetId ? [{ id: input.datasetId }] : await this.listDatasets({});
    const all: Metric[] = [];
    for (const dataset of datasets) { const data = await this.request<{ metrics?: ApiMetric[] }>(this.path(dataset.id, '/metrics')); for (const item of data.metrics ?? []) all.push(this.metric(dataset.id, item)); }
    return all.filter((m) => !input.search || `${m.name} ${m.label ?? ''} ${m.description ?? ''}`.toLowerCase().includes(input.search.toLowerCase())).slice(0, input.limit ?? 50);
  }
  async getMetric(input: { metricId?: string; name?: string; datasetId?: string }): Promise<Metric> { const name = input.metricId ?? input.name; if (!name) throw new VerdonzError('metricId or name is required.', 'INVALID_INPUT'); const metrics = await this.listMetrics({ datasetId: input.datasetId, search: name, limit: 100 }); const found = metrics.find((m) => m.name === name || m.id === name || m.label === name); if (!found) throw new VerdonzError(`Metric "${name}" was not found.`, 'NOT_FOUND', 404); return found; }
  async ask(input: AskInput): Promise<QueryResult> {
    if (!input.datasetId) throw new VerdonzError('datasetId is required for production ask requests because Verdonz semantic routes are datasource-scoped.', 'INVALID_INPUT');
    const data = await this.request<{ rows?: unknown[]; explanation?: string; resolved_query?: unknown; sql?: string; metric?: string; evidence?: Evidence[] }>(this.path(input.datasetId, '/nl-query'), { method: 'POST', body: JSON.stringify({ question: input.question, limit: 100 }) });
    return { answer: data.explanation ?? 'Verdonz returned a governed query result.', supportingData: data.rows, evidence: data.evidence, relevantMetrics: data.metric ? [data.metric] : undefined, metadata: { resolvedQuery: data.resolved_query, sql: data.sql } };
  }
  async investigate(_input: InvestigateInput): Promise<InvestigationResult> { throw new VerdonzError('No dedicated Verdonz investigation endpoint is available in the current API contract.', 'UNSUPPORTED_CAPABILITY'); }
  async getEvidence(input: EvidenceInput): Promise<Evidence[]> { if (!input.datasetId || !input.metric) throw new VerdonzError('datasetId and metric are required for production evidence lookup.', 'INVALID_INPUT'); const data = await this.request<{ upstream?: Array<{ kind?: string; name?: string }>; downstream?: Array<{ kind?: string; name?: string }>; depends_on?: Array<{ kind?: string; name?: string }>; used_by?: Array<{ kind?: string; name?: string }> }>(this.path(input.datasetId, `/lineage?kind=metric&name=${encodeURIComponent(input.metric)}`)); return [...(data.upstream ?? []), ...(data.downstream ?? []), ...(data.depends_on ?? []), ...(data.used_by ?? [])].map((item) => ({ title: item.name, source: item.kind, detail: `Lineage ${item.kind ?? 'object'}: ${item.name ?? 'unknown'}` })); }
}
