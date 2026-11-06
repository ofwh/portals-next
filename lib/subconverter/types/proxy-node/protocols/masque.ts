import type { NodeFieldsBase } from '../common';

export interface MasqueNodeFields extends NodeFieldsBase {
  type: 'masque';
  port: number;
  server: string;
  bbrProfile?: string;
  congestionControl?: string;
  cwnd?: number;
  underlyingProxy?: string;
  dnsServers?: Array<string>;
  handshakeTimeout?: number;
  interfaceName?: string;
  localAddresses?: Array<string>;
  ipStackMode?: string;
  ipStackCongestionController?: string;
  ipVersion?: string;
  mptcp?: boolean;
  mtu?: number;
  nameCertVerify?: string;
  network?: string;
  privateKey?: string;
  publicKey?: string;
  remoteDnsResolve?: boolean;
  routingMark?: number;
  allowInsecure?: boolean;
  serverName?: string;
  tcpFastOpen?: boolean;
  udp?: boolean;
  uri?: string;
}
