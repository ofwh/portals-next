import type { NodeFieldsBase } from '../common';

export interface TailscaleNodeFields extends NodeFieldsBase {
  type: 'tailscale';
  acceptRoutes?: boolean;
  authKey?: string;
  controlUrl?: string;
  underlyingProxy?: string;
  ephemeral?: boolean;
  exitNode?: string;
  exitNodeAllowLanAccess?: boolean;
  hostname?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  routingMark?: number;
  stateDir?: string;
  tcpFastOpen?: boolean;
  udp?: boolean;
}
