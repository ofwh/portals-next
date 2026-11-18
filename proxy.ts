import { type NextRequest, NextResponse } from 'next/server';
import { resolveLocale } from '@/i18n/config';
import { appError, errorResponse } from '@/lib/api';
import { withRequestContext } from '@/lib/api/request-context';
import { auth } from '@/lib/auth';

function sessionErrorResponse(
  request: NextRequest,
  code: 'common.UNAUTHORIZED' | 'common.INTERNAL_ERROR',
): Promise<Response> {
  return withRequestContext(request, () => {
    if (/^\/api\/auth\//.test(request.nextUrl.pathname)) {
      const headers = { 'Cache-Control': 'no-store' };

      return code === 'common.UNAUTHORIZED'
        ? Response.json({ code: 'UNAUTHORIZED', message: 'Unauthorized' }, { status: 401, headers })
        : Response.json(auth.$ERROR_CODES.FAILED_TO_GET_SESSION, { status: 500, headers });
    }

    const locale = resolveLocale(request.cookies.get('language')?.value);

    return errorResponse(appError(code), locale);
  });
}

export async function proxy(request: NextRequest): Promise<Response> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true, disableRefresh: true },
    });

    if (session) {
      return NextResponse.next();
    }

    return sessionErrorResponse(request, 'common.UNAUTHORIZED');
  } catch {
    return sessionErrorResponse(request, 'common.INTERNAL_ERROR');
  }
}

export const config = {
  matcher: [
    '/api/analytics/(.*)',
    '/api/auth/((?!(?:sign-in|sign-up|sign-out|get-session)(?:/|$)).+)',
    '/api/dashboard/(.*)',
    '/api/preferences/(update)',
    '/api/routes/(.*)',
    '/api/shortcuts/(.*)',
    '/api/subscriptions/(.*)',
    '/api/tags/(.*)',
    '/api/workflow/(.*)',
  ],
};
