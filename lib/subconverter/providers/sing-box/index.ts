import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { parse as parseConfig, toString as stringifyConfig } from './config';
import { format as formatProxies, parse as parseProxies } from './proxies';
import type { SingBoxConfig } from '../../types/sing-box';
import { ConfigProvider } from '../provider';
import type { ProviderStringOptions } from '../provider';

export class SingBoxProvider extends ConfigProvider<SingBoxConfig> {
  readonly supports = [
    'Shadowsocks',
    'VMess',
    'VLESS',
    'Trojan',
    'HTTP',
    'HTTPS',
    'SOCKS5',
    'Hysteria',
    'Hysteria2',
    'TUIC',
    'AnyTLS',
    'Snell',
    'Naive',
  ] as const;

  toString(options?: ProviderStringOptions): string {
    if (!this.config) {
      throw new Error('Load configuration before serialization');
    }

    return stringifyConfig(this.config, options);
  }

  constructor() {
    super('outbounds', SingBoxProvider.parse);
  }

  get proxies() {
    return structuredClone(
      (this.config?.outbounds ?? []).filter(
        (node) => !['direct', 'block', 'dns', 'selector', 'urltest'].includes(node.type),
      ),
    );
  }

  get groups() {
    return structuredClone(
      (this.config?.outbounds ?? []).filter((node) => ['selector', 'urltest'].includes(node.type)),
    );
  }

  get rules() {
    return structuredClone(this.config?.route?.rules ?? []);
  }

  protected readNodes(config: SingBoxConfig): ProxyNode[] {
    return parseProxies(config);
  }

  protected writeNodes(nodes: ProxyNode[]): SingBoxConfig {
    return formatProxies(nodes, this.config);
  }

  static parse(content: string): SingBoxConfig {
    return parseConfig(content);
  }
}

export * as config from './config';
export * as proxies from './proxies';
export * as ruleset from './ruleset';
