import { appError } from '@/lib/api';
import type { RouteMode } from '@/lib/constants/routes';
import tags from '@/lib/repositories/tags';
import { parseHeaders } from '@/lib/shared/headers';
import { validJson } from '@/lib/shared/validation';
import type { RouteListParams } from '@/lib/types/routes';
import * as v from '../shared/validation';

function validateBase(params: Record<string, unknown>) {
  const name = v.string(params.name).trim();

  if (name.length > 100) {
    throw appError('common.INVALID_PARAMS');
  }

  return {
    name,
    description: v.nullableString(params.description),
    status: v.boolean(params.status),
    pathname: v.pathname(params.pathname),
    token: v.nullableString(params.token),
    expiredAt: v.date(params.expiredAt),
  };
}

function validateRequest(params: Record<string, unknown>) {
  const method = v.choice(params.method === undefined ? 'GET' : params.method, ['GET', 'POST']);
  const format = v.choice(params.format === undefined ? 'JSON' : params.format, ['JSON', 'TEXT', 'FORM']);
  const body = v.nullableString(params.body);
  const headers = v.nullableString(params.headers);

  if (method === 'POST' && format === 'JSON' && body?.trim() && !validJson(body)) {
    throw appError('common.INVALID_PARAMS');
  }

  try {
    parseHeaders(headers);
  } catch {
    throw appError('common.INVALID_PARAMS');
  }

  return {
    ...validateBase(params),
    url: v.url(params.url),
    method,
    body,
    format,
    headers,
    proxy: v.nullableString(params.proxy),
    cors: v.choice(params.cors === undefined ? 0 : params.cors, [-1, 0, 1]),
  };
}

export const validateProxy = validateRequest;

export function validateCache(params: Record<string, unknown>) {
  const ttl = params.ttl ?? 0;

  if (typeof ttl !== 'number' || !Number.isFinite(ttl) || ttl < 0 || !Number.isSafeInteger(Math.ceil(ttl * 86400))) {
    throw appError('common.INVALID_PARAMS');
  }

  return { ...validateRequest(params), ttl };
}

export function validateRedirect(params: Record<string, unknown>) {
  return {
    ...validateBase(params),
    url: v.url(params.url),
    statusCode: v.choice(params.statusCode === undefined ? 302 : params.statusCode, [301, 302, 307, 308]),
  };
}

export function validateOriginal(params: Record<string, unknown>) {
  return {
    ...validateBase(params),
    content: v.string(params.content, true),
    contentType: v.string(params.contentType === undefined ? 'application/json' : params.contentType),
    language: v.string(params.language === undefined ? 'plaintext' : params.language),
  };
}

export function validateTagIds(value: unknown, type: RouteMode): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw appError('common.INVALID_PARAMS');
  }

  const ids = [...new Set(value.map((id: unknown) => v.string(id)))];
  const selected = tags.findByIds(ids);

  if (selected.length !== ids.length || selected.some((tag) => tag.group !== type)) {
    throw appError('common.INVALID_PARAMS');
  }

  return ids;
}

export function validateList(input: unknown): RouteListParams {
  const params = v.record(input);
  const pagination = v.pagination(params);
  const search = params.search === undefined ? '' : v.string(params.search, true).trim();
  const status = params.status === undefined ? 'all' : v.choice(params.status, ['all', 'enabled', 'disabled']);

  return { ...pagination, search, status };
}
