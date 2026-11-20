import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import 'server-only';
import { resolveLocale } from '@/i18n/config';
import logger from '@/lib/api/logger';
import type { Locale } from './index';
import { appError, AppError, errorResponse, okResponse, readParams } from './index';
import { withRequestContext } from './request-context';

export async function handle<T>(request: Request, action: (params: unknown) => T | Promise<T>): Promise<Response> {
  return handleResponse(request, async (params) => okResponse(await action(params)));
}

export async function handleResponse(
  request: Request,
  action: (params: unknown, context: { locale: Locale }) => Response | Promise<Response>,
): Promise<Response> {
  return withRequestContext(request, async () => {
    let locale = resolveLocale((await cookies()).get('language')?.value);
    const respondError = async (error: AppError): Promise<Response> => {
      const response = errorResponse(error, locale);
      const data: unknown = await response.clone().json();

      logger.log(error.code === 'common.INTERNAL_ERROR' ? 'error' : 'warn', '接口返回错误', {
        method: request.method,
        pathname: new URL(request.url).pathname,
        data,
      });

      return response;
    };

    try {
      locale = await getLocale();
      const params = await readParams(request);

      if (!params.ok) {
        return respondError(params.error);
      }

      return await action(params.value, { locale });
    } catch (error) {
      if (error instanceof AppError) {
        return respondError(error);
      }

      return respondError(appError('common.INTERNAL_ERROR'));
    }
  });
}
