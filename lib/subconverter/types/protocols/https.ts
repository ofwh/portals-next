import type { NodeFieldsBase } from '../common';

export interface HTTPSNodeFieldsHeadersItem {
  name: string;
  value: Array<string>;
}

export interface HTTPSNodeFields extends NodeFieldsBase {
  type: 'https';
  port: number;
  server: string;
  certificate?: string | Array<string>;
  underlyingProxy?: string;
  fingerprint?: string;
  headers?: Array<HTTPSNodeFieldsHeadersItem>;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  routingMark?: number;
  allowInsecure?: boolean;
  serverName?: string;
  tcpFastOpen?: boolean;
  tls?: boolean;
  username?: string;
  alpn?: Array<string>;
  tlsMinVersion?: string;
  tlsMaxVersion?: string;
  tls13?: boolean;
  utlsEnabled?: boolean;
  certificatePath?: string;
  clientFingerprint?: string;
  echEnabled?: boolean;
  echConfig?: string | Array<string>;
  echConfigPath?: string;
  disableSni?: boolean;
  packetNetworks?: Array<string>;
}
