import type { Locale } from '@/i18n/config';
import { BUSINESS_MESSAGES } from '@/lib/errors';
import type { ERROR_CODE } from './codes';
import type { ErrorCode, ErrorParams } from './errors';
import en from './messages/en.json';
import zhCN from './messages/zh-CN.json';

export type { Locale } from '@/i18n/config';

type CommonMessages = { common: Record<keyof typeof ERROR_CODE.common, string> };

const commonMessages = { 'zh-CN': zhCN, en } satisfies Record<string, CommonMessages>;

export const MESSAGES = {
  'zh-CN': { ...commonMessages['zh-CN'], ...BUSINESS_MESSAGES['zh-CN'] },
  en: { ...commonMessages.en, ...BUSINESS_MESSAGES.en },
};

export function formatMessage(code: ErrorCode, params: ErrorParams = {}, locale: Locale = 'en'): string {
  for (const [namespace, messages] of Object.entries(MESSAGES[locale === 'zh-CN' ? 'zh-CN' : 'en'])) {
    for (const [key, template] of Object.entries(messages)) {
      if (`${namespace}.${key}` === code) {
        return template.replace(/\{(\w+)\}/g, (placeholder: string, name: string) =>
          Object.hasOwn(params, name) ? String(params[name]) : placeholder,
        );
      }
    }
  }

  return commonMessages[locale === 'zh-CN' ? 'zh-CN' : 'en'].common.INTERNAL_ERROR;
}
