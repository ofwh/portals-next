import type { NodeFieldsBase } from '../common';

export interface ShadowquicNodeFields extends NodeFieldsBase {
  type: 'shadowquic';
  port: number;
  server: string;
  alpn?: Array<string>;
  bbrProfile?: string;
  congestionControl?: string;
  cwnd?: number;
  underlyingProxy?: string;
  disableMtuDiscovery?: boolean;
  downMbps?: number;
  interfaceName?: string;
  ipVersion?: string;
  keepAliveInterval?: number;
  maxDatagramFrameSize?: number;
  maxOpenStreams?: number;
  mptcp?: boolean;
  password?: string;
  quicVersions?: Array<string>;
  recvWindow?: number;
  recvWindowConn?: number;
  routingMark?: number;
  serverName?: string;
  tcpFastOpen?: boolean;
  udpOverStream?: boolean;
  upMbps?: number;
  username?: string;
  zeroRtt?: boolean;
}
