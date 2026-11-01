import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { parse as parseConfig, toString as stringifyConfig } from './config';
import { format as formatProxies, parse as parseProxies } from './proxies';
import type { LoonConfig } from '../../types/loon';
import { ConfigProvider } from '../provider';
import type { ProviderStringOptions } from '../provider';

export class LoonProvider extends ConfigProvider<LoonConfig> {
  readonly supports = ['Shadowsocks', 'VMess', 'VLESS', 'Trojan', 'AnyTLS', 'Hysteria2'] as const;

  toString(options?: ProviderStringOptions): string {
    if (!this.config) {
      throw new Error('Load configuration before serialization');
    }

    return stringifyConfig(this.config, options);
  }

  constructor() {
    super('Proxy', LoonProvider.parse);
  }

  get proxies() {
    return structuredClone(this.config?.Proxy ?? []);
  }

  get groups() {
    return structuredClone(this.config?.['Proxy Group'] ?? []);
  }

  get rules() {
    return structuredClone(this.config?.Rule ?? []);
  }

  protected readNodes(config: LoonConfig): ProxyNode[] {
    return parseProxies(config);
  }

  protected writeNodes(nodes: ProxyNode[]): LoonConfig {
    return formatProxies(nodes, this.config);
  }

  static parse(content: string): LoonConfig {
    return parseConfig(content);
  }
}

export * as config from './config';
export * as proxies from './proxies';
export * as ruleset from './ruleset';
