import { appError } from '@/lib/api';
import type { SubscriptionNode } from './types';
import { sanitizeJson } from './utils';
import { assertJson, isRecord } from '../../utils';
import type { NamedType } from '../types';

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && !!value.trim();
}

function strings(value: unknown) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function optionalFieldsValid(value: Record<string, unknown>): boolean {
  const stringFields = [
    'password',
    'cipher',
    'uuid',
    'flow',
    'sni',
    'servername',
    'fingerprint',
    'client-fingerprint',
    'network',
    'obfs',
    'obfs-password',
    'ports',
    'auth-str',
    'plugin',
  ];

  if (stringFields.some((key) => value[key] !== undefined && typeof value[key] !== 'string')) {
    return false;
  }

  if (
    ['udp', 'tfo', 'tls', 'skip-cert-verify'].some((key) => value[key] !== undefined && typeof value[key] !== 'boolean')
  ) {
    return false;
  }

  if (
    ['alterId', 'idle-session-check-interval', 'idle-session-timeout', 'min-idle-session'].some(
      (key) =>
        value[key] !== undefined &&
        (typeof value[key] !== 'number' || !Number.isInteger(value[key]) || Number(value[key]) < 0),
    )
  ) {
    return false;
  }

  if (value.alpn !== undefined && !strings(value.alpn)) {
    return false;
  }

  for (const [key, fields] of [
    ['reality-opts', ['public-key', 'short-id']],
    ['grpc-opts', ['grpc-service-name']],
  ] as const) {
    const options = value[key];

    if (
      options !== undefined &&
      (!isRecord(options) || fields.some((field) => options[field] !== undefined && typeof options[field] !== 'string'))
    ) {
      return false;
    }
  }
  const ws = value['ws-opts'];

  if (ws !== undefined) {
    if (
      !isRecord(ws) ||
      (ws.path !== undefined && typeof ws.path !== 'string') ||
      (ws['early-data-header-name'] !== undefined && typeof ws['early-data-header-name'] !== 'string') ||
      (ws['max-early-data'] !== undefined && typeof ws['max-early-data'] !== 'number')
    ) {
      return false;
    }

    if (
      ws.headers !== undefined &&
      (!isRecord(ws.headers) || !Object.values(ws.headers).every((v) => typeof v === 'string'))
    ) {
      return false;
    }
  }

  const http = value['http-opts'];

  if (
    http !== undefined &&
    (!isRecord(http) ||
      (http.path !== undefined && !strings(http.path)) ||
      (http.headers !== undefined && (!isRecord(http.headers) || !Object.values(http.headers).every(strings))))
  ) {
    return false;
  }

  const h2 = value['h2-opts'];

  if (
    h2 !== undefined &&
    (!isRecord(h2) ||
      (h2.path !== undefined && typeof h2.path !== 'string') ||
      (h2.host !== undefined && !strings(h2.host)))
  ) {
    return false;
  }

  const pluginOptions = value['plugin-opts'];

  return pluginOptions === undefined || isRecord(pluginOptions);
}

export function normalizeSubscriptionNode(raw: unknown): SubscriptionNode | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  const value = sanitizeJson(raw);

  if (!isRecord(value)) {
    return undefined;
  }

  const port = Number(value.port);

  if (
    !nonempty(value.name) ||
    !nonempty(value.server) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    !optionalFieldsValid(value)
  ) {
    return undefined;
  }

  const type = typeof value.type === 'string' ? value.type.toLowerCase().trim() : '';

  switch (type) {
    case 'ss':
      if (!nonempty(value.cipher) || typeof value.password !== 'string') {
        return undefined;
      }

      break;
    case 'vmess':
    case 'vless':
      if (!nonempty(value.uuid)) {
        return undefined;
      }

      break;
    case 'trojan':
    case 'hysteria2':
    case 'anytls':
      if (!nonempty(value.password)) {
        return undefined;
      }

      break;
    case 'hysteria':
      if (
        ![value.up, value.down].every((v) => (typeof v === 'string' && !!v.trim()) || (typeof v === 'number' && v > 0))
      ) {
        return undefined;
      }

      if (value.protocol !== undefined && !['udp', 'wechat-video', 'faketcp'].includes(String(value.protocol))) {
        return undefined;
      }

      break;
    default:
      return undefined;
  }

  return {
    ...value,
    type,
    name: value.name.trim(),
    server: value.server.trim().replace(/^\[|\]$/g, ''),
    port,
  } as SubscriptionNode;
}

export const subscriptionNodesSchema: NamedType<SubscriptionNode[]> = {
  descriptor: { kind: 'ref', id: 'subscription.nodes', version: 1 },
  base: { kind: 'array', items: { kind: 'record', values: { kind: 'any' } } },
  parse(value) {
    assertJson(value);
    if (!Array.isArray(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value.map((item: unknown) => {
      const node = normalizeSubscriptionNode(item);

      if (!node) {
        throw appError('common.INVALID_PARAMS');
      }

      return node;
    });
  },
};
