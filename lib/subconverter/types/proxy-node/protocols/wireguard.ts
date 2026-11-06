import type { NodeFieldsBase } from '../common';

export interface WireGuardNodeFieldsWireGuardPeersItem {
  server: string;
  port: number;
  publicKey: string;
  preSharedKey?: string;
  allowedIps?: Array<string>;
  reserved?: Array<number>;
  keepAlive?: number;
}

export interface WireGuardNodeFields extends NodeFieldsBase {
  type: 'wireguard';
  amneziaWgOptionVersion?: number;
  amneziaWgOptionJc?: number;
  amneziaWgOptionJmin?: number;
  amneziaWgOptionJmax?: number;
  amneziaWgOptionS1?: number;
  amneziaWgOptionS2?: number;
  amneziaWgOptionS3?: number;
  amneziaWgOptionS4?: number;
  amneziaWgOptionH1?: string;
  amneziaWgOptionH2?: string;
  amneziaWgOptionH3?: string;
  amneziaWgOptionH4?: string;
  amneziaWgOptionI1?: string;
  amneziaWgOptionI2?: string;
  amneziaWgOptionI3?: string;
  amneziaWgOptionI4?: string;
  amneziaWgOptionI5?: string;
  amneziaWgOptionJ1?: string;
  amneziaWgOptionJ2?: string;
  amneziaWgOptionJ3?: string;
  amneziaWgOptionItime?: number;
  amneziaWgOptionHeaderProtectionKey?: string;
  amneziaWgOptionContentPaddingAddition?: string;
  amneziaWgOptionRekeyAfterTime?: string;
  amneziaWgOptionRekeyTimeout?: string;
  amneziaWgOptionRejectAfterTime?: string;
  amneziaWgOptionKeepaliveTimeout?: string;
  amneziaWgOptionMaxHandshakeAttempts?: string;
  amneziaWgOptionRandomTrailers?: boolean;
  amneziaWgOptionDisableCookies?: boolean;
  underlyingProxy?: string;
  dnsServers?: Array<string>;
  interfaceName?: string;
  localAddresses: Array<string>;
  ipStackMode?: string;
  ipStackCongestionController?: string;
  ipVersion?: string;
  mptcp?: boolean;
  mtu?: number;
  wireGuardPeers: Array<WireGuardNodeFieldsWireGuardPeersItem>;
  keepAlive?: number;
  privateKey: string;
  refreshServerIpInterval?: number;
  remoteDnsResolve?: boolean;
  routingMark?: number;
  tcpFastOpen?: boolean;
  udp?: boolean;
  wireGuardWorkers?: number;
  wireGuardSystem?: boolean;
  wireGuardInterfaceName?: string;
  wireGuardListenPort?: number;
}
