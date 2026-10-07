import { z } from 'zod';
export const limit = z.number().int().min(1).max(100).optional();
export const timeRange = z.object({ start: z.string().min(1), end: z.string().min(1), dimension: z.string().min(1).optional(), column: z.string().min(1).optional() }).optional();
export const listSchema = z.object({ search: z.string().min(1).optional(), limit, datasetId: z.string().min(1).optional() });
export const metricSchema = z.object({ metricId: z.string().min(1).optional(), name: z.string().min(1).optional(), datasetId: z.string().min(1).optional() }).refine((v) => v.metricId || v.name, { message: 'metricId or name is required' });
export const datasetSchema = z.object({ search: z.string().min(1).optional(), limit });
export const askSchema = z.object({ question: z.string().min(1).max(4000), datasetId: z.string().min(1).optional(), context: z.string().max(4000).optional(), timeRange });
export const investigateSchema = z.object({ metric: z.string().min(1), datasetId: z.string().min(1).optional(), timeRange, comparisonPeriod: timeRange, dimensions: z.array(z.string().min(1)).max(32).optional() });
export const evidenceSchema = z.object({ resultId: z.string().min(1).optional(), metric: z.string().min(1).optional(), datasetId: z.string().min(1).optional() });
