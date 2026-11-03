import type { NodeFieldsBase } from '../common';

export interface OpenVPNNodeFieldsPeerInfoItem {
  name: string;
  value: string;
}

export interface OpenVPNNodeFields extends NodeFieldsBase {
  type: 'openvpn';
  port: number;
  server: string;
  auth?: string;
  ca?: string;
  cert?: string;
  cipher?: string;
  compLzo?: string;
  dataCiphers?: Array<string>;
  dataCiphersFallback?: string;
  dev?: string;
  underlyingProxy?: string;
  dnsServers?: Array<string>;
  handshakeTimeout?: number;
  interfaceName?: string;
  ipStackMode?: string;
  ipStackCongestionController?: string;
  ipVersion?: string;
  key?: string;
  keyDirection?: string;
  mptcp?: boolean;
  mtu?: number;
  password?: string;
  peerInfo?: Array<OpenVPNNodeFieldsPeerInfoItem>;
  ping?: number;
  pingRestart?: number;
  proto?: string;
  remoteDnsResolve?: boolean;
  routingMark?: number;
  tcpFastOpen?: boolean;
  tlsAuth?: string;
  tlsCrypt?: string;
  tlsCryptV2?: string;
  tranWindow?: number;
  udp?: boolean;
  username?: string;
}
