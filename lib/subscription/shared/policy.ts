import type { ProxyGroupKind } from '../types/policy';

export const proxyGroupKinds = [
  'select',
  'url-test',
  'fallback',
  'load-balance',
  'relay',
  'ssid',
  'smart',
  'remote-filter',
] as const;

export function isProxyGroupKind(value: unknown): value is ProxyGroupKind {
  return proxyGroupKinds.some((item) => item === value);
}
