import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import { createHeaders } from '@/lib/shared/http';
import { stringValue } from '@/lib/workflow/nodes/core/schemas';
import type { Parser } from '@/lib/workflow/nodes/types';
import type { HttpRequestConfig } from './types';

function isHeader(value: unknown): value is HttpRequestConfig['headers'][number] {
  return (
    isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.value === 'string'
  );
}

export function isConfig(value: unknown): value is HttpRequestConfig {
  return (
    isRecord(value) &&
    (value.method === 'GET' || value.method === 'POST') &&
    typeof value.url === 'string' &&
    Array.isArray(value.headers) &&
    value.headers.every(isHeader) &&
    typeof value.body === 'string'
  );
}

export const configSchema: Parser<HttpRequestConfig> = {
  parse(value) {
    if (!isConfig(value) || Object.keys(value).some((key) => !['method', 'url', 'headers', 'body'].includes(key))) {
      throw appError('common.INVALID_PARAMS');
    }

    try {
      const url = new URL(value.url);

      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw appError('common.INVALID_PARAMS');
      }

      for (const header of value.headers) {
        if (!header.name.trim()) {
          throw appError('common.INVALID_PARAMS');
        }
      }

      createHeaders(value.headers);
    } catch {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};

export const outputSchema = stringValue;
