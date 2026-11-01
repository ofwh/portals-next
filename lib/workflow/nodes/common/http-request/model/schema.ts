import { appError } from '@/lib/api';
import type { HttpRequestConfig, HttpRequestHeader, HttpRequestOutput, HttpResponseHeader } from './types';
import { assertJson, isRecord } from '../../../../utils';
import type { NamedType, Parser } from '../../../types';
import { isOutputFormat } from '../../schema';

function isHeader(value: unknown): value is HttpRequestHeader {
  return (
    isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.value === 'string'
  );
}

function isResponseHeader(value: unknown): value is HttpResponseHeader {
  return isRecord(value) && typeof value.name === 'string' && typeof value.value === 'string';
}

export function isConfig(value: unknown): value is HttpRequestConfig {
  return (
    isRecord(value) &&
    (value.method === 'GET' || value.method === 'POST') &&
    typeof value.url === 'string' &&
    Array.isArray(value.headers) &&
    value.headers.every(isHeader) &&
    typeof value.body === 'string' &&
    isOutputFormat(value.outputFormat)
  );
}

export const configSchema: Parser<HttpRequestConfig> = {
  parse(value) {
    if (
      !isConfig(value) ||
      Object.keys(value).some((key) => !['method', 'url', 'headers', 'body', 'outputFormat'].includes(key))
    ) {
      throw appError('common.INVALID_PARAMS');
    }

    try {
      const url = new URL(value.url);

      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw appError('common.INVALID_PARAMS');
      }

      const headers = new Headers();

      for (const header of value.headers) {
        if (!header.name.trim()) {
          throw appError('common.INVALID_PARAMS');
        }

        headers.append(header.name, header.value);
      }
    } catch {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
export const outputSchema: NamedType<HttpRequestOutput> = {
  descriptor: { kind: 'ref', id: 'common.httpRequest.output', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    assertJson(value);
    if (
      !isRecord(value) ||
      !Array.isArray(value.header) ||
      !Object.hasOwn(value, 'body') ||
      !value.header.every(isResponseHeader)
    ) {
      throw appError('common.INVALID_PARAMS');
    }

    return {
      header: value.header.map((header) => ({
        name: header.name,
        value: header.value,
      })),
      body: value.body,
    };
  },
};
