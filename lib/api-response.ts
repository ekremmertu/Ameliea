/**
 * API response helpers — standard error format and body parsing
 * All API routes should use these for consistent client handling.
 */

import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

export const ErrorCodes = {
  INVALID_JSON: 'INVALID_JSON',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ApiErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ApiErrorBody {
  error: string;
  message?: string;
  details?: unknown;
}

/**
 * Standard API error response
 */
export function apiError(
  code: ApiErrorCode,
  status: number,
  message?: string,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: code };
  if (message) body.message = message;
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

/**
 * Zod validation error → 400 with flatten() details (consistent format for clients)
 */
export function validationError(zodError: ZodError): NextResponse<ApiErrorBody> {
  return apiError(
    ErrorCodes.VALIDATION_ERROR,
    400,
    'Validation failed',
    zodError.flatten()
  );
}

/**
 * Parse JSON body; returns null on failure (caller should return apiError(INVALID_JSON)).
 */
export async function parseJsonBody<T = unknown>(req: Request): Promise<T | null> {
  try {
    const body = await req.json();
    return body as T;
  } catch {
    return null;
  }
}

/**
 * Convenience: parse body or return INVALID_JSON response
 */
export async function parseJsonBodyOrError(req: Request): Promise<
  | { body: unknown; response: null }
  | { body: null; response: NextResponse<ApiErrorBody> }
> {
  const body = await parseJsonBody(req);
  if (body === null) {
    return { body: null, response: apiError(ErrorCodes.INVALID_JSON, 400, 'Invalid request body') };
  }
  return { body, response: null };
}
