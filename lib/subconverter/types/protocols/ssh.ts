import type { NodeFieldsBase } from '../common';

export interface SSHNodeFields extends NodeFieldsBase {
  type: 'ssh';
  port: number;
  server: string;
  underlyingProxy?: string;
  hostKey?: Array<string>;
  hostKeyAlgorithms?: Array<string>;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  password?: string;
  privateKey?: string;
  privateKeyPassphrase?: string;
  routingMark?: number;
  tcpFastOpen?: boolean;
  username?: string;
}
