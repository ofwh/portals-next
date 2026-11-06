import type { Locale } from '@/i18n/config';
import type { Theme } from '@/lib/services/preferences/shared';

export type Preferences = { theme: Theme; language: Locale; timeFormat: string };
export type PreferenceValues = Partial<Record<keyof Preferences, string>>;
