import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { parse as parseConfig, toString as stringifyConfig } from './config';
import { format as formatProxies, parse as parseProxies } from './proxies';
import type { LinksConfig } from '../../types/links';
import { ConfigProvider } from '../provider';
import type { ProviderStringOptions } from '../provider';

export class LinksProvider extends ConfigProvider<LinksConfig> {
  readonly supports = ['Shadowsocks', 'VMess', 'VLESS', 'Trojan', 'Hysteria2', 'AnyTLS'] as const;

  toString(options?: ProviderStringOptions): string {
    if (!this.config) {
      throw new Error('Load configuration before serialization');
    }

    return stringifyConfig(this.config, options);
  }

  constructor(parse = LinksProvider.parse) {
    super('links', parse);
  }

  get proxies() {
    return structuredClone(this.config?.links ?? []);
  }

  static parse(content: string): LinksConfig {
    return parseConfig(content);
  }

  protected readNodes(config: LinksConfig): ProxyNode[] {
    return parseProxies(config);
  }

  protected writeNodes(nodes: ProxyNode[]): LinksConfig {
    return formatProxies(nodes, this.config);
  }
}

export * as config from './config';
export * as proxies from './proxies';
export * as ruleset from './ruleset';
