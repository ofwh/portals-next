import type { NodeFieldsBase } from '../common';

export interface TrusttunnelNodeFields extends NodeFieldsBase {
  type: 'trusttunnel';
  port: number;
  server: string;
  alpn?: Array<string>;
  bbrProfile?: string;
  certificate?: string;
  clientFingerprint?: string;
  congestionControl?: string;
  cwnd?: number;
  underlyingProxy?: string;
  echEnabled?: boolean;
  echConfig?: string;
  echQueryServerName?: string;
  fingerprint?: string;
  healthCheck?: boolean;
  interfaceName?: string;
  ipVersion?: string;
  maxConnections?: number;
  maxStreams?: number;
  minStreams?: number;
  mptcp?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  quic?: boolean;
  routingMark?: number;
  allowInsecure?: boolean;
  serverName?: string;
  tcpFastOpen?: boolean;
  udp?: boolean;
  username?: string;
}
