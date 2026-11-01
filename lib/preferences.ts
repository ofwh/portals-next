import { defaultLocale, locales } from '@/i18n/config';
import { DEFAULT_TIME_FORMAT } from '@/lib/date-time';
import type { Preferences, PreferenceValues } from '@/lib/types/preferences';

export const themes = ['system', 'light', 'dark'] as const;
export type Theme = (typeof themes)[number];
export const preferenceKeys = ['theme', 'language', 'timeFormat'] as const;
export const preferenceCookieOptions = { path: '/', maxAge: 31536000, sameSite: 'lax' } as const;
export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  language: defaultLocale,
  timeFormat: DEFAULT_TIME_FORMAT,
};

export function resolveTheme(value: string | undefined): Theme {
  return themes.find((theme) => theme === value) ?? 'system';
}

export function normalizeTimeFormat(value: string | undefined): string | undefined {
  const pattern = value?.trim();

  return pattern && pattern.length <= 100 && !/[\x00-\x1f]/.test(pattern) ? pattern : undefined;
}

export function resolvePreferences(database: PreferenceValues, cookie: PreferenceValues = {}): Preferences {
  return {
    theme: themes.find((theme) => theme === database.theme) ?? resolveTheme(cookie.theme),
    language:
      locales.find((locale) => locale === database.language) ??
      locales.find((locale) => locale === cookie.language) ??
      defaultLocale,
    timeFormat:
      normalizeTimeFormat(database.timeFormat) ?? normalizeTimeFormat(cookie.timeFormat) ?? DEFAULT_TIME_FORMAT,
  };
}
