import type { VerdonzClient } from '../client/types.js';
import { investigateSchema } from './schemas.js';
export const investigate = async (client: VerdonzClient, input: unknown) => client.investigate(investigateSchema.parse(input ?? {}));
