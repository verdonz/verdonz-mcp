import type { VerdonzClient } from '../client/types.js';
import { askSchema } from './schemas.js';
export const ask = async (client: VerdonzClient, input: unknown) => client.ask(askSchema.parse(input ?? {}));
