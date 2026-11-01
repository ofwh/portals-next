import { parseDocument } from 'yaml';
import { appError } from '@/lib/api';
import type { FormatParser } from './types';
import { isRecord } from '../../../../../utils';

export const clashProvider = {
  matches(content) {
    return /^[\[{]/.test(content) || /(^|\n)\s*(proxies|Proxy)\s*:/.test(content);
  },
  extract(content) {
    const document = parseDocument(content, { merge: false, uniqueKeys: true });

    if (document.errors.length) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    const value: unknown = document.toJS({ maxAliasCount: 20 });
    const proxies = Array.isArray(value) ? value : isRecord(value) ? (value.proxies ?? value.Proxy) : undefined;

    if (!Array.isArray(proxies)) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    return proxies;
  },
} satisfies FormatParser;
