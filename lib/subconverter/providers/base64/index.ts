import { parse as parseConfig, toString as stringifyConfig } from './config';
import type { Base64Config } from '../../types/base64';
import { LinksProvider } from '../links';
import type { ProviderStringOptions } from '../provider';

export class Base64Provider extends LinksProvider {
  readonly supports = ['Shadowsocks', 'VMess', 'VLESS', 'Trojan', 'Hysteria2', 'AnyTLS'] as const;

  toString(options?: ProviderStringOptions): string {
    if (!this.config) {
      throw new Error('Load configuration before serialization');
    }

    return stringifyConfig(this.config, options);
  }

  constructor() {
    super(Base64Provider.parse);
  }

  static parse(content: string): Base64Config {
    return parseConfig(content);
  }
}

export * as config from './config';
export * as proxies from './proxies';
export * as ruleset from './ruleset';
