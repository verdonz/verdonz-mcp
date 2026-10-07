import type { VerdonzClient } from '../client/types.js';
import { evidenceSchema } from './schemas.js';
export const getEvidence = async (client: VerdonzClient, input: unknown) => client.getEvidence(evidenceSchema.parse(input ?? {}));
