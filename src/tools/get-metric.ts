import type { VerdonzClient } from '../client/types.js';
import { metricSchema } from './schemas.js';
export const getMetric = async (client: VerdonzClient, input: unknown) => client.getMetric(metricSchema.parse(input ?? {}));
