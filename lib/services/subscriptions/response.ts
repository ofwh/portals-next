import { getLocale } from 'next-intl/server';
import 'server-only';
import { resolveLocale } from '@/i18n/config';
import { appError, errorResponse } from '@/lib/api';
import type { Locale } from '@/lib/api';

const errors = {
  notFound: { code: 'subscriptions.ROUTE_NOT_FOUND', status: 404 },
  config: { code: 'subscriptions.ROUTE_CONFIG_ERROR', status: 400 },
  service: { code: 'subscriptions.ROUTE_SERVICE_ERROR', status: 500 },
} as const;

export async function routeError(type: keyof typeof errors): Promise<Response> {
  let locale: Locale = 'en';

  try {
    locale = resolveLocale(await getLocale());
  } catch {
    locale = 'en';
  }

  const { code, status } = errors[type];
  const response = errorResponse(appError(code), locale);

  return new Response(response.body, { status, headers: response.headers });
}
