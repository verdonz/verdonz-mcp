export type TimeRange = { start: string; end: string; dimension?: string; column?: string };

export interface Metric {
  id: string;
  name: string;
  label?: string;
  description?: string;
  definition?: string;
  dimensions?: string[];
  owner?: string;
  source?: string;
  freshness?: string;
  synonyms?: string[];
  type?: string;
  grain?: string;
  aggregation?: string;
  guardrails?: Record<string, unknown>;
  access?: Record<string, unknown>;
}

export interface Dataset { id: string; name: string; type?: string; description?: string; }
export interface Evidence { id?: string; title?: string; source?: string; detail?: string; metadata?: Record<string, unknown>; }
export interface QueryResult {
  answer: string;
  supportingData?: unknown[];
  evidence?: Evidence[];
  relevantMetrics?: string[];
  metadata?: Record<string, unknown>;
}
export interface InvestigationResult {
  metric: string;
  summary: string;
  changes?: unknown[];
  possibleDrivers?: unknown[];
  evidence?: Evidence[];
  metadata?: Record<string, unknown>;
}

export interface AskInput { question: string; datasetId?: string; context?: string; timeRange?: TimeRange; }
export interface InvestigateInput { metric: string; datasetId?: string; timeRange?: TimeRange; comparisonPeriod?: TimeRange; dimensions?: string[]; }
export interface EvidenceInput { resultId?: string; metric?: string; datasetId?: string; }

export interface VerdonzClient {
  listMetrics(input: { search?: string; limit?: number; datasetId?: string }): Promise<Metric[]>;
  getMetric(input: { metricId?: string; name?: string; datasetId?: string }): Promise<Metric>;
  listDatasets(input: { search?: string; limit?: number }): Promise<Dataset[]>;
  ask(input: AskInput): Promise<QueryResult>;
  investigate(input: InvestigateInput): Promise<InvestigationResult>;
  getEvidence(input: EvidenceInput): Promise<Evidence[]>;
}
