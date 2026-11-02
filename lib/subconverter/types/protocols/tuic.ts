import type { NodeFieldsBase } from '../common';

interface TUICCommonFields extends NodeFieldsBase {
  type: 'tuic';
  port: number;
  server: string;
  alpn?: Array<string>;
  bbrProfile?: string;
  certificate?: string | Array<string>;
  congestionControl?: string;
  cwnd?: number;
  underlyingProxy?: string;
  disableMtuDiscovery?: boolean;
  disableSni?: boolean;
  echEnabled?: boolean;
  echConfig?: string | Array<string>;
  echQueryServerName?: string;
  fastOpen?: boolean;
  fingerprint?: string;
  heartbeatInterval?: number;
  interfaceName?: string;
  localAddresses?: Array<string>;
  ipVersion?: string;
  maxDatagramFrameSize?: number;
  maxOpenStreams?: number;
  maxUdpRelayPacketSize?: number;
  mptcp?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  recvWindow?: number;
  recvWindowConn?: number;
  reduceRtt?: boolean;
  requestTimeout?: number;
  routingMark?: number;
  allowInsecure?: boolean;
  serverName?: string;
  tcpFastOpen?: boolean;
  token?: string;
  udpOverStream?: boolean;
  udpOverStreamVersion?: number;
  udpRelayMode?: string;
  uuid?: string;
  zeroRttHandshake?: boolean;
  heartbeat?: string;
  tls?: boolean;
  tlsMinVersion?: string;
  tlsMaxVersion?: string;
  tls13?: boolean;
  utlsEnabled?: boolean;
  certificatePath?: string;
  clientFingerprint?: string;
  echConfigPath?: string;
  packetNetworks?: Array<string>;
}

export interface TUICUuidNodeFields extends TUICCommonFields {
  uuid: string;
  password: string;
  token?: never;
}
export interface TUICTokenNodeFields extends TUICCommonFields {
  token: string;
  uuid?: never;
  password?: never;
}
export type TUICNodeFields = TUICUuidNodeFields | TUICTokenNodeFields;
