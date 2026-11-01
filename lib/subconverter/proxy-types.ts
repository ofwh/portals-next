import type { ProxyNodeType } from '@/lib/types/subscriptions/nodes';

export const proxyTypes: Record<string, ProxyNodeType> = {
  ss: 'Shadowsocks',
  ssr: 'ShadowsocksR',
  vmess: 'VMess',
  vless: 'VLESS',
  trojan: 'Trojan',
  snell: 'Snell',
  http: 'HTTP',
  https: 'HTTPS',
  socks5: 'SOCKS5',
  wireguard: 'WireGuard',
  hysteria: 'Hysteria',
  hysteria2: 'Hysteria2',
  tuic: 'TUIC',
  anytls: 'AnyTLS',
  naive: 'Naive',
  mieru: 'Mieru',
};
