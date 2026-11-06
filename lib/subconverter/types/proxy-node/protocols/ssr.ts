import type { NodeFieldsBase } from '../common';

export interface SSRNodeFields extends NodeFieldsBase {
  type: 'ssr';
  port: number;
  server: string;
  cipher: string;
  underlyingProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  obfs: string;
  obfsParam?: string;
  password: string;
  protocol: string;
  protocolParam?: string;
  routingMark?: number;
  tcpFastOpen?: boolean;
  udp?: boolean;
}
