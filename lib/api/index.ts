import { appError, businessCode } from './errors';
import type { AppError, ErrorCode } from './errors';
import { formatMessage } from './messages';
import type { Locale } from './messages';

export { appError, AppError, ERROR_CODE } from './errors';
export type { ErrorCode, ErrorParams } from './errors';
export type { Locale } from './messages';

export const SUCCESS_CODE = 0;

export type Result<T> = { ok: true; value: T } | { ok: false; error: AppError };
export type ResponseError = { code: ErrorCode; message: string };
export type BaseResponse<T> =
  | { code: typeof SUCCESS_CODE; data: T; message: string; error?: never }
  | { code: number; data: null; message: string; error: ResponseError };

const headers = { 'Cache-Control': 'no-store', Vary: 'Accept-Language' };

export function errorMessage(error: AppError, locale: Locale = 'en'): string {
  return formatMessage(error.code, error.params, locale);
}

export function okResponse<T>(data: T): Response {
  return Response.json({ code: SUCCESS_CODE, data, message: 'OK' } satisfies BaseResponse<T>, { headers });
}

export function errorResponse(error: AppError, locale: Locale = 'en'): Response {
  const message = errorMessage(error, locale);

  return Response.json(
    {
      code: businessCode(error.code),
      data: null,
      message,
      error: { code: error.code, message },
    } satisfies BaseResponse<null>,
    { headers },
  );
}

export async function readParams(request: Request): Promise<Result<unknown>> {
  try {
    const value: unknown = await request.json();

    return { ok: true, value };
  } catch {
    return { ok: false, error: appError('common.INVALID_PARAMS') };
  }
}

export async function readForm(request: Request): Promise<Result<FormData>> {
  try {
    return { ok: true, value: await request.formData() };
  } catch {
    return { ok: false, error: appError('common.INVALID_PARAMS') };
  }
}
