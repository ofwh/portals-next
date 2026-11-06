import type { ProxyType } from '@/lib/subconverter/types';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { FilterConfig } from './types';

export const definition = {
  type: 'subscription.filter',
  ...nodeLabel('workflowNodes.subscription.filter.name'),
  version: 1,
};
export const defaultConfig: FilterConfig = { protocols: [], namePattern: [], exclude: false };

export const protocolOptions = {
  ss: 'Shadowsocks',
  vmess: 'VMess',
  vless: 'VLESS',
  trojan: 'Trojan',
  hysteria: 'Hysteria',
  hysteria2: 'Hysteria2',
  anytls: 'AnyTLS',
  ssr: 'ShadowsocksR',
  http: 'HTTP',
  https: 'HTTPS',
  socks5: 'SOCKS5',
  tuic: 'TUIC',
  wireguard: 'WireGuard',
  ssh: 'SSH',
  snell: 'Snell',
  naive: 'Naive',
  mieru: 'Mieru',
  masque: 'MASQUE',
  openvpn: 'OpenVPN',
  shadowquic: 'ShadowQUIC',
  sudoku: 'Sudoku',
  tailscale: 'Tailscale',
  trusttunnel: 'TrustTunnel',
  zerotier: 'ZeroTier',
  easytier: 'EasyTier',
  'gost-relay': 'GOST Relay',
} satisfies Record<ProxyType, string>;
