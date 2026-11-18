import { appError } from '@/lib/api';
import {
  ANALYTICS_GRANULARITIES,
  ANALYTICS_LIMITS,
  ANALYTICS_MAX_RANGE_MS,
  ANALYTICS_ROUTE_TYPES,
} from '@/lib/constants/analytics';
import type {
  AnalyticsEvent,
  AnalyticsRange,
  AnalyticsRankingParams,
  AnalyticsTotalsParams,
} from '@/lib/types/analytics';
import * as v from '../shared/validation';

function params(input: unknown, allowed: readonly string[]) {
  const value = v.record(input);

  if (Object.keys(value).some((key) => !allowed.includes(key))) {
    throw appError('common.INVALID_PARAMS');
  }

  return value;
}

function date(value: unknown): Date {
  const result = v.date(value);

  if (!result || result.getTime() < 0) {
    throw appError('common.INVALID_PARAMS');
  }

  return result;
}

function range(value: Record<string, unknown>): AnalyticsRange {
  const from = date(value.from);
  const to = date(value.to);

  if (from >= to || to.getTime() - from.getTime() > ANALYTICS_MAX_RANGE_MS) {
    throw appError('common.INVALID_PARAMS');
  }

  return { from, to };
}

export function event(input: unknown): AnalyticsEvent {
  const value = params(input, [
    'id',
    'requestId',
    'visitAt',
    'routeType',
    'url',
    'pathname',
    'ua',
    'ip',
    'duration',
    'statusCode',
    'errorCode',
  ]);
  const url = v.url(value.url);
  const pathname = v.string(value.pathname);
  const statusCode = value.statusCode == null ? null : v.positiveInteger(value.statusCode);
  const errorCode = value.errorCode == null ? null : v.positiveInteger(value.errorCode);

  if (
    typeof value.duration !== 'number' ||
    !Number.isSafeInteger(value.duration) ||
    value.duration < 0 ||
    (statusCode !== null && (statusCode < 200 || statusCode > 599)) ||
    /[#\s\u0000-\u001f\u007f]/.test(url) ||
    !pathname.startsWith('/')
  ) {
    throw appError('common.INVALID_PARAMS');
  }

  return {
    id: value.id === undefined ? undefined : v.string(value.id),
    requestId: v.string(value.requestId),
    visitAt: date(value.visitAt),
    routeType: v.choice(value.routeType, ANALYTICS_ROUTE_TYPES),
    url,
    pathname,
    ua: v.nullableString(value.ua),
    ip: v.nullableString(value.ip),
    duration: value.duration,
    statusCode,
    errorCode,
  };
}

export function totals(input: unknown): AnalyticsTotalsParams {
  const value = params(input, ['from', 'to', 'granularity']);

  return {
    ...range(value),
    granularity: v.choice(value.granularity === undefined ? 'hour' : value.granularity, ANALYTICS_GRANULARITIES),
  };
}

export function ranking(input: unknown): AnalyticsRankingParams {
  const value = params(input, ['from', 'to', 'routeType', 'limit']);

  return {
    ...range(value),
    routeType: value.routeType === undefined ? undefined : v.choice(value.routeType, ANALYTICS_ROUTE_TYPES),
    limit: v.choice(value.limit === undefined ? 10 : value.limit, ANALYTICS_LIMITS),
  };
}
