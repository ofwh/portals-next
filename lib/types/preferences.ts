import type { Locale } from '@/i18n/config';
import type { Theme } from '@/lib/preferences';

export type Preferences = { theme: Theme; language: Locale; timeFormat: string };
export type PreferenceValues = Partial<Record<keyof Preferences, string>>;
