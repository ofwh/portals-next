import { appError } from '@/lib/api';
import { ROUTE_TYPES } from '@/lib/constants/routes';
import { isRecord } from '@/lib/shared/data';
import { validPathname } from '@/lib/shared/validation';
import type { Parser } from '@/lib/types/workflow';
import { stringValue } from '@/lib/workflow/node/core/schemas';
import type { RouteConfig } from './types';

export function isConfig(value: unknown): value is RouteConfig {
  return (
    isRecord(value) &&
    ROUTE_TYPES.some((mode) => mode === value.mode) &&
    typeof value.pathname === 'string' &&
    (value.method === 'GET' || value.method === 'POST') &&
    typeof value.body === 'string' &&
    typeof value.token === 'string'
  );
}

export const configSchema: Parser<RouteConfig> = {
  parse(value) {
    if (
      !isConfig(value) ||
      Object.keys(value).some((key) => !['mode', 'pathname', 'method', 'body', 'token'].includes(key)) ||
      !validPathname(value.pathname)
    ) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};

export const outputSchema = stringValue;
