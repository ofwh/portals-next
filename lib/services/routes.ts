import 'server-only';
import { appError } from '@/lib/api';
import { ROUTE_TYPE, ROUTE_TYPES } from '@/lib/constants';
import { caches, originals, proxies, redirects } from '@/lib/repositories/routes';
import { parseHeaders, validJson } from '@/lib/routes/validation';
import { createRouteService } from './route-service';
import * as v from './validation';

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

function validateProxy(params: Record<string, unknown>) {
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

function validateRedirect(params: Record<string, unknown>) {
  return {
    ...validateBase(params),
    url: v.url(params.url),
    statusCode: v.choice(params.statusCode === undefined ? 302 : params.statusCode, [301, 302, 307, 308]),
  };
}

function validateOriginal(params: Record<string, unknown>) {
  return {
    ...validateBase(params),
    content: v.string(params.content, true),
    contentType: v.string(params.contentType === undefined ? 'application/json' : params.contentType),
    language: v.string(params.language === undefined ? 'plaintext' : params.language),
  };
}

function validateCache(params: Record<string, unknown>) {
  const ttl = Number(params.ttl ?? 0);

  return { ...validateProxy(params), ttl };
}

const services = {
  [ROUTE_TYPE.PROXY]: createRouteService(ROUTE_TYPE.PROXY, proxies, validateProxy, {
    notFound: 'routes.PROXY_NOT_FOUND',
    pathExist: 'routes.PROXY_PATH_EXIST',
  }),
  [ROUTE_TYPE.REDIRECT]: createRouteService(ROUTE_TYPE.REDIRECT, redirects, validateRedirect, {
    notFound: 'routes.REDIRECT_NOT_FOUND',
    pathExist: 'routes.REDIRECT_PATH_EXIST',
  }),
  [ROUTE_TYPE.CACHE]: createRouteService(ROUTE_TYPE.CACHE, caches, validateCache, {
    notFound: 'routes.CACHE_NOT_FOUND',
    pathExist: 'routes.CACHE_PATH_EXIST',
  }),
  [ROUTE_TYPE.ORIGINAL]: createRouteService(ROUTE_TYPE.ORIGINAL, originals, validateOriginal, {
    notFound: 'routes.ORIGINAL_NOT_FOUND',
    pathExist: 'routes.ORIGINAL_PATH_EXIST',
  }),
};

function selectService(input: unknown) {
  const { type, ...params } = v.record(input);

  return { service: services[v.choice(type, ROUTE_TYPES)], params };
}

export function list(input: unknown) {
  const { service, params } = selectService(input);

  return service.list(params);
}

export function detail(input: unknown) {
  const { service, params } = selectService(input);

  return service.get(params);
}

export function update(input: unknown) {
  const { service, params } = selectService(input);

  return service.update(params);
}

export function remove(input: unknown) {
  const { service, params } = selectService(input);

  return service.remove(params);
}

const service = { list, detail, update, remove };

export default service;
