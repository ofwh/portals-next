import type { LinksConfig } from '../../types/links';
import type { ProviderStringOptions } from '../provider';

export function parse(content: string): LinksConfig {
  return {
    links: content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  };
}

export function toString(_config: LinksConfig, _options?: ProviderStringOptions): string {
  throw new Error('Provider serialization is not implemented');
}
