import { headers } from 'next/headers';
import { cache } from 'react';
import 'server-only';
import { auth } from '@/lib/auth';

export const getRequestSession = cache(async () =>
  auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } }),
);
