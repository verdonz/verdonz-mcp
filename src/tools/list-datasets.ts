import type { VerdonzClient } from '../client/types.js';
import { datasetSchema } from './schemas.js';
export const listDatasets = async (client: VerdonzClient, input: unknown) => client.listDatasets(datasetSchema.parse(input ?? {}));
