import type { NodeFieldsBase } from '../common';

export interface NaiveNodeFields extends NodeFieldsBase {
  type: 'naive';
  server: string;
  port: number;
  underlyingProxy?: string;
  tcpFastOpen?: boolean;
  username?: string;
  password: string;
  naiveInsecureConcurrency?: number;
  naiveQuic?: boolean;
  naiveUot?: boolean;
  tls?: boolean;
  serverName?: string;
  allowInsecure?: boolean;
  alpn?: Array<string>;
  tlsMinVersion?: string;
  tlsMaxVersion?: string;
  tls13?: boolean;
  utlsEnabled?: boolean;
  certificate?: string | Array<string>;
  certificatePath?: string;
  clientFingerprint?: string;
  echEnabled?: boolean;
  echConfig?: string | Array<string>;
  echConfigPath?: string;
  disableSni?: boolean;
  packetNetworks?: Array<string>;
}
