import type { languageMessages, Locale } from './config';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof languageMessages.en;
  }
}
