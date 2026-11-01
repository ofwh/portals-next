import type { SingBoxConfig } from '../../types/sing-box';
import type { ProviderStringOptions } from '../provider';

export function parse(content: string): SingBoxConfig {
  const value: unknown = JSON.parse(content);

  if (Array.isArray(value)) {
    return { outbounds: value as NonNullable<SingBoxConfig['outbounds']> };
  }

  if (!value || typeof value !== 'object') {
    throw new Error('Invalid sing-box configuration');
  }

  return value as SingBoxConfig;
}

export function toString(_config: SingBoxConfig, _options?: ProviderStringOptions): string {
  throw new Error('Provider serialization is not implemented');
}
