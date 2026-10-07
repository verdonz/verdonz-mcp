import { z } from 'zod';

const envSchema = z.object({
  VERDONZ_API_KEY: z.string().min(1).optional(),
  VERDONZ_BASE_URL: z.string().url().optional(),
  VERDONZ_MOCK: z.enum(['true', 'false']).default('false'),
});

export type Config = { apiKey?: string; baseUrl?: string; mock: boolean };

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.parse(env);
  const mock = parsed.VERDONZ_MOCK === 'true';
  if (!mock && !parsed.VERDONZ_API_KEY) throw new Error('VERDONZ_API_KEY is required unless VERDONZ_MOCK=true.');
  if (!mock && !parsed.VERDONZ_BASE_URL) throw new Error('VERDONZ_BASE_URL is required unless VERDONZ_MOCK=true.');
  return { apiKey: parsed.VERDONZ_API_KEY, baseUrl: parsed.VERDONZ_BASE_URL?.replace(/\/$/, ''), mock };
}
