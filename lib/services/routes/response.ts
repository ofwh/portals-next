import 'server-only';
import { AppError, businessCode } from '@/lib/api';
import type { ErrorCode } from '@/lib/api';

const responseErrors = new WeakMap<Response, number>();

export class RouteError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
  ) {
    super(code);
    this.name = 'RouteError';
  }
}

export function withErrorCode(response: Response, code: ErrorCode): Response {
  responseErrors.set(response, businessCode(code));

  return response;
}

export function getErrorCode(response: Response): number | null {
  return responseErrors.get(response) ?? null;
}

export function copyErrorCode(source: Response, target: Response): Response {
  const code = getErrorCode(source);

  if (code !== null) {
    responseErrors.set(target, code);
  }

  return target;
}

export function failure(error: unknown): Response {
  const status = error instanceof RouteError ? error.status : 500;
  const code = error instanceof RouteError || error instanceof AppError ? error.code : 'routes.ROUTE_SERVICE_ERROR';

  return withErrorCode(new Response(null, { status }), code);
}
