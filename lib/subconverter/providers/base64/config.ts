import { decodeBase64Utf8 } from '../../encoding';
import type { Base64Config } from '../../types/base64';
import { LinksProvider } from '../links';
import type { ProviderStringOptions } from '../provider';

export function parse(content: string): Base64Config {
  return LinksProvider.parse(decodeBase64Utf8(content));
}

export function toString(_config: Base64Config, _options?: ProviderStringOptions): string {
  throw new Error('Provider serialization is not implemented');
}
