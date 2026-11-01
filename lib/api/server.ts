import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import 'server-only';
import { resolveLocale } from '@/i18n/config';
import type { Locale } from './index';
import { appError, AppError, errorResponse, okResponse, readParams } from './index';

export async function handle<T>(request: Request, action: (params: unknown) => T | Promise<T>): Promise<Response> {
  return handleResponse(request, async (params) => okResponse(await action(params)));
}

export async function handleResponse(
  request: Request,
  action: (params: unknown, context: { locale: Locale }) => Response | Promise<Response>,
): Promise<Response> {
  let locale = resolveLocale((await cookies()).get('language')?.value);

  try {
    locale = await getLocale();
    const params = await readParams(request);

    if (!params.ok) {
      return errorResponse(params.error, locale);
    }

    return await action(params.value, { locale });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, locale);
    }

    console.error('业务接口执行失败', error);

    return errorResponse(appError('common.INTERNAL_ERROR'), locale);
  }
}
