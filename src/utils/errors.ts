export class VerdonzError extends Error { constructor(message: string, public readonly code: string, public readonly status?: number) { super(message); } }
export function toSafeError(error: unknown): VerdonzError {
  if (error instanceof VerdonzError) return error;
  return new VerdonzError(error instanceof Error ? error.message : 'Unexpected upstream error.', 'UPSTREAM_ERROR');
}
