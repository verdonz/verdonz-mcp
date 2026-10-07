import type { VerdonzClient } from '../client/types.js';
import { listSchema } from './schemas.js';
export const listMetrics = async (client: VerdonzClient, input: unknown) => client.listMetrics(listSchema.parse(input ?? {}));
