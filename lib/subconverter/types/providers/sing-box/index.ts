export interface SingBoxProxyNodeTlsUtls {
  enabled?: boolean;
  fingerprint?: string;
}

export interface SingBoxProxyNodeTlsReality {
  enabled?: boolean;
  publicKey?: string;
  shortId?: string;
}

export interface SingBoxProxyNodeTlsEch {
  enabled?: boolean;
  config?: string | Array<string>;
  configPath?: string;
  dynamicRecordSizingDisabled?: boolean;
  pqSignatureSchemesEnabled?: boolean;
}

export interface SingBoxProxyNodeTls {
  enabled?: boolean;
  disableSni?: boolean;
  serverName?: string;
  insecure?: boolean;
  alpn?: Array<string>;
  minVersion?: string;
  maxVersion?: string;
  certificate?: string | Array<string>;
  certificatePath?: string;
  utls?: SingBoxProxyNodeTlsUtls;
  reality?: SingBoxProxyNodeTlsReality;
  ech?: SingBoxProxyNodeTlsEch;
}

export interface SingBoxProxyNodeTransportHeadersItem {
  name: string;
  value: string | Array<string>;
}

export interface SingBoxProxyNodeTransport {
  type: 'http' | 'quic' | 'tcp' | 'ws' | 'grpc' | 'httpupgrade';
  host?: string | Array<string>;
  path?: string;
  headers?: Array<SingBoxProxyNodeTransportHeadersItem>;
  serviceName?: string;
  maxEarlyData?: number;
  earlyDataHeaderName?: string;
}

export interface SingBoxProxyNodeMultiplexBrutal {
  enabled?: boolean;
  upMbps?: number;
  downMbps?: number;
}

export interface SingBoxProxyNodeMultiplex {
  enabled?: boolean;
  protocol?: string;
  maxConnections?: number;
  minStreams?: number;
  maxStreams?: number;
  padding?: boolean;
  brutal?: SingBoxProxyNodeMultiplexBrutal;
}

export interface SingBoxProxyNodeUdpOverTcpVariant1 {
  enabled?: boolean;
  version?: number;
}

export interface SingBoxProxyNodePeersItem {
  server: string;
  serverPort: string | number;
  publicKey: string;
  preSharedKey?: string;
  allowedIps?: Array<string>;
  reserved?: Array<number>;
  persistentKeepaliveInterval?: number;
}

export interface SingBoxProxyNodeObfsVariant2 {
  type: string;
  password: string;
}

export interface SingBoxProxyNode {
  type:
    | 'anytls'
    | 'http'
    | 'hysteria'
    | 'hysteria2'
    | 'snell'
    | 'trojan'
    | 'tuic'
    | 'vless'
    | 'vmess'
    | 'wireguard'
    | 'shadowsocks'
    | 'socks'
    | 'naive';
  tag?: string;
  server?: string;
  serverPort?: string | number;
  username?: string;
  password?: string;
  method?: string;
  uuid?: string;
  alterId?: number;
  security?: string;
  plugin?: string;
  pluginOpts?: string;
  version?: string | number;
  psk?: string;
  userkey?: string;
  reuse?: boolean;
  mode?: string;
  obfsMode?: string;
  obfsHost?: string;
  network?: string | Array<string>;
  tls?: SingBoxProxyNodeTls;
  transport?: SingBoxProxyNodeTransport;
  multiplex?: SingBoxProxyNodeMultiplex;
  flow?: string;
  packetEncoding?: string;
  detour?: string;
  bindInterface?: string;
  routingMark?: number;
  tcpFastOpen?: boolean;
  udpOverTcp?: SingBoxProxyNodeUdpOverTcpVariant1 | boolean;
  privateKey?: string;
  peerPublicKey?: string;
  preSharedKey?: string;
  localAddress?: Array<string>;
  reserved?: Array<number>;
  mtu?: number;
  peers?: Array<SingBoxProxyNodePeersItem>;
  upMbps?: number;
  downMbps?: number;
  auth?: string | Array<string>;
  authStr?: string;
  obfs?: string | SingBoxProxyNodeObfsVariant2;
  serverPorts?: Array<string>;
  hopInterval?: string;
  congestionControl?: string;
  udpRelayMode?: string;
  zeroRttHandshake?: boolean;
  heartbeat?: string;
  idleSessionCheckInterval?: string;
  idleSessionTimeout?: string;
  minIdleSession?: number;
  insecureConcurrency?: number;
  quic?: boolean;
}

export interface SingBoxWireGuardEndpointPeersItem {
  address: string;
  port: string | number;
  publicKey: string;
  preSharedKey?: string;
  allowedIps?: Array<string>;
  persistentKeepaliveInterval?: number;
  reserved?: Array<number>;
}

export interface SingBoxWireGuardEndpoint {
  type: 'wireguard';
  address: Array<string>;
  privateKey: string;
  peers: Array<SingBoxWireGuardEndpointPeersItem>;
  tag?: string;
  system?: boolean;
  name?: string;
  mtu?: number;
  listenPort?: number;
  workers?: number;
}

export interface SingBoxAction {
  type: 'dns' | 'direct' | 'block' | 'selector' | 'urltest';
  tag?: string;
  outbounds?: Array<string>;
  default?: string;
  url?: string;
  interval?: string;
  tolerance?: number;
  interruptExistConnections?: boolean;
}

export type SingBoxOutbound = SingBoxProxyNode | SingBoxAction;

export interface SingBoxConfig {
  outbounds?: Array<SingBoxOutbound>;
  endpoints?: Array<SingBoxWireGuardEndpoint>;
}

export interface SingBoxMultiplexOptions {
  enabled?: boolean;
  protocol?: string;
  maxConnections?: number;
  minStreams?: number;
  maxStreams?: number;
  padding?: boolean;
  brutal?: SingBoxProxyNodeMultiplexBrutal;
}

export type { SingBoxNodeFields } from './fields';

type SingBoxProtocolNodes = { [T in SingBoxProxyNode['type']]: SingBoxProxyNode & { type: T } };
export type SingBoxNode = SingBoxProtocolNodes[SingBoxProxyNode['type']] | SingBoxWireGuardEndpoint;
