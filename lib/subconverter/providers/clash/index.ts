import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { parse as parseConfig, toString as stringifyConfig } from './config';
import { format as formatProxies, parse as parseProxies } from './proxies';
import { resolve } from './ruleset';
import type { ClashConfig } from '../../types/clash';
import { ConfigProvider } from '../provider';
import type { ProviderStringOptions } from '../provider';

export class ClashProvider extends ConfigProvider<ClashConfig> {
  readonly supports = [
    'Shadowsocks',
    'ShadowsocksR',
    'VMess',
    'VLESS',
    'Trojan',
    'Snell',
    'HTTP',
    'HTTPS',
    'SOCKS5',
    'WireGuard',
    'Hysteria',
    'Hysteria2',
    'TUIC',
    'AnyTLS',
    'Mieru',
  ] as const;

  toString(options?: ProviderStringOptions): string {
    if (!this.config) {
      throw new Error('Load configuration before serialization');
    }

    return stringifyConfig(this.config, options);
  }

  constructor() {
    super('proxies', ClashProvider.parse);
  }

  get proxies() {
    return structuredClone(this.config?.proxies ?? this.config?.Proxy ?? []);
  }

  get groups() {
    return structuredClone(this.config?.['proxy-groups'] ?? []);
  }

  get rules(): string[] {
    return resolve(this.config ?? {});
  }

  protected readNodes(config: ClashConfig): ProxyNode[] {
    return parseProxies(config);
  }

  protected writeNodes(nodes: ProxyNode[]): ClashConfig {
    return formatProxies(nodes, this.config);
  }

  static parse(content: string): ClashConfig {
    return parseConfig(content);
  }
}

export * as config from './config';
export * as proxies from './proxies';
export * as ruleset from './ruleset';
