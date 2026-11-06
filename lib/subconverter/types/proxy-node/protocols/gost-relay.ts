import type { NodeFieldsBase } from '../common';

export interface GostRelayNodeFields extends NodeFieldsBase {
  type: 'gost-relay';
  port: number;
  server: string;
  certificate?: string;
  clientFingerprint?: string;
  underlyingProxy?: string;
  fingerprint?: string;
  forward?: boolean;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  mux?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  routingMark?: number;
  allowInsecure?: boolean;
  serverName?: string;
  tcpFastOpen?: boolean;
  tls?: boolean;
  udp?: boolean;
  username?: string;
}
