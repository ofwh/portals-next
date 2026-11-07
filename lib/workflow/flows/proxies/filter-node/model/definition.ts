import type { ProxyProtocol } from '@/lib/subscription/types/proxy-node';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { FilterConfig } from './types';

export const definition = {
  type: 'proxy.filter',
  ...nodeLabel('workflowNodes.proxy.filter.name'),
  version: 1,
};
export const defaultConfig: FilterConfig = { protocols: [], namePattern: [], exclude: false };

export const protocolOptions = {
  ss: 'Shadowsocks',
  ssr: 'ShadowsocksR',
  vmess: 'VMess',
  vless: 'VLESS',
  trojan: 'Trojan',
  socks5: 'SOCKS5',
  http: 'HTTP',
  https: 'HTTPS',
  hysteria: 'Hysteria',
  hysteria2: 'Hysteria2',
  tuic: 'TUIC',
  anytls: 'AnyTLS',
  naive: 'Naive',
  wireguard: 'WireGuard',
  mieru: 'Mieru',
} satisfies Record<ProxyProtocol, string>;
