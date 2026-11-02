import type { NodeFieldsBase } from '../common';

export interface SOCKS5NodeFields extends NodeFieldsBase {
  type: 'socks5';
  port: number;
  server: string;
  certificate?: string;
  underlyingProxy?: string;
  fingerprint?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  routingMark?: number;
  allowInsecure?: boolean;
  tcpFastOpen?: boolean;
  tls?: boolean;
  udp?: boolean;
  username?: string;
  version?: string;
  udpOverTcpEnabled?: boolean;
  udpOverTcpVersion?: number;
  packetNetworks?: Array<string>;
}
