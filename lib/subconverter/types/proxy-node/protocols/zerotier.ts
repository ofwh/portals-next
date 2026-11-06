import type { NodeFieldsBase } from '../common';

export interface ZerotierNodeFieldsOrbitItem {
  world?: string;
  seed?: string;
}

export interface ZerotierNodeFields extends NodeFieldsBase {
  type: 'zerotier';
  underlyingProxy?: string;
  dnsServers?: Array<string>;
  encryptedHello?: boolean;
  identitySecret?: string;
  interfaceName?: string;
  ipStackMode?: string;
  ipStackCongestionController?: string;
  ipVersion?: string;
  lowBandwidth?: boolean;
  mptcp?: boolean;
  mtu?: number;
  network?: string;
  orbit?: Array<ZerotierNodeFieldsOrbitItem>;
  physicalMtu?: number;
  planet?: string;
  primaryPort?: number;
  remoteDnsResolve?: boolean;
  remoteTraceLevel?: number;
  remoteTraceTarget?: string;
  routingMark?: number;
  secondaryPort?: number;
  stateDir?: string;
  tcpFallbackMode?: string;
  tcpFallbackRelay?: string;
  tcpFastOpen?: boolean;
  udp?: boolean;
}
