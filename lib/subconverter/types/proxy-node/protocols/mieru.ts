import type { NodeFieldsBase } from '../common';

export interface MieruNodeFields extends NodeFieldsBase {
  type: 'mieru';
  server: string;
  underlyingProxy?: string;
  mieruHandshakeMode?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  multiplexing?: string;
  password: string;
  port: number;
  ports?: Array<string>;
  routingMark?: number;
  tcpFastOpen?: boolean;
  mieruTrafficPattern?: string;
  network?: string;
  udp?: boolean;
  username: string;
  mieruProfile?: string;
  mtu?: number;
}
