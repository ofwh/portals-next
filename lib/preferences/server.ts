import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import 'server-only';
import { auth } from '@/lib/auth';
import { preferenceCookieOptions, preferenceKeys, resolvePreferences } from '@/lib/preferences';
import service from '@/lib/services/preferences';
import type { Preferences, PreferenceValues } from '@/lib/types/preferences';

export const getPreferenceCookies = cache(async (): Promise<PreferenceValues> => {
  const cookieStore = await cookies();

  return {
    theme: cookieStore.get('theme')?.value,
    language: cookieStore.get('language')?.value,
    timeFormat: cookieStore.get('timeFormat')?.value,
  };
});

export const getRequestPreferences = cache(async (): Promise<Preferences> => {
  const fallback = await getPreferenceCookies();
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });

  return session ? service.get({}, fallback) : resolvePreferences({}, fallback);
});

export async function writePreferenceCookies(preferences: Preferences, secure: boolean) {
  const cookieStore = await cookies();

  for (const key of preferenceKeys) {
    cookieStore.set(key, preferences[key], { ...preferenceCookieOptions, secure });
  }
}
