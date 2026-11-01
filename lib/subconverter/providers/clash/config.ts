import { parseDocument } from 'yaml';
import type { ClashConfig } from '../../types/clash';
import type { ProviderStringOptions } from '../provider';

export function parse(content: string): ClashConfig {
  const document = parseDocument(content, { merge: false, uniqueKeys: true });

  if (document.errors.length) {
    throw new Error('Invalid Clash configuration');
  }

  const value: unknown = document.toJS({ maxAliasCount: 20 });

  if (Array.isArray(value)) {
    return { proxies: value as NonNullable<ClashConfig['proxies']> };
  }

  if (!value || typeof value !== 'object') {
    throw new Error('Invalid Clash configuration');
  }

  return value as ClashConfig;
}

export function toString(_config: ClashConfig, _options?: ProviderStringOptions): string {
  throw new Error('Provider serialization is not implemented');
}
