import en from '@/messages/en.json';
import zhCN from '@/messages/zh-CN.json';

export const languageMessages = { en, 'zh-CN': zhCN };
export type Locale = keyof typeof languageMessages;
export const locales = Object.keys(languageMessages) as Locale[];
export const defaultLocale: Locale = 'en';

export type MessageTree = { [key: string]: string | MessageTree };

export function mergeMessages(fallback: MessageTree, translated: MessageTree): MessageTree {
  const result = { ...fallback };

  for (const [key, value] of Object.entries(translated)) {
    const base = fallback[key];

    result[key] = typeof value === 'object' && typeof base === 'object' ? mergeMessages(base, value) : value;
  }

  return result;
}

export function resolveLocale(language: string | undefined): Locale {
  return locales.find((locale) => locale === language) ?? defaultLocale;
}
