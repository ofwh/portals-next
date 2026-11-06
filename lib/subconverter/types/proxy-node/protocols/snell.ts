import type { NodeFieldsBase } from '../common';

export interface SnellNodeFields extends NodeFieldsBase {
  type: 'snell';
  port: number;
  server: string;
  clientFingerprint?: string;
  underlyingProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  obfs?: string;
  obfsHost?: string;
  shadowTlsPassword?: string;
  shadowTlsVersion?: number;
  shadowTlsAlpn?: Array<string>;
  password: string;
  snellReuse?: boolean;
  routingMark?: number;
  tcpFastOpen?: boolean;
  udp?: boolean;
  snellVersion?: number;
  snellUserKey?: string;
  snellNetwork?: Array<string>;
  snellMode?: string;
  snellUdpPort?: number;
  shadowTlsSni?: string;
}
