export const proxyNodeTypes = [
  'Shadowsocks',
  'ShadowsocksR',
  'VMess',
  'Trojan',
  'Snell',
  'HTTP',
  'HTTPS',
  'SOCKS5',
  'WireGuard',
  'VLESS',
  'Hysteria',
  'Hysteria2',
  'TUIC',
  'AnyTLS',
  'Naive',
  'Mieru',
] as const;
export type ProxyNodeType = (typeof proxyNodeTypes)[number];

export interface ProxyWireGuardPeer {
  hostname: string;
  port: number;
  publicKey: string;
  preSharedKey: string;
  allowedIPs: string;
  reserved: string;
  keepAlive: number;
}

export interface ProxyNodeParameters {
  id: number;
  groupId: number;
  group: string;
  remark: string;
  hostname: string;
  port: number;
  congestionControl: string;
  username: string;
  password: string;
  encryptMethod: string;
  plugin: string;
  pluginOption: string;
  protocol: string;
  protocolParam: string;
  obfs: string;
  obfsParam: string;
  userId: string;
  alterId: number;
  transferProtocol: string;
  fakeType: string;
  authStr: string;
  idleSessionCheckInterval: number;
  idleSessionTimeout: number;
  minIdleSession: number;
  naiveInsecureConcurrency: number;
  naiveQuic: boolean | null;
  naiveUot: boolean | null;
  tlsStr: string;
  tlsSecure: boolean;
  host: string;
  path: string;
  edge: string;
  quicSecure: string;
  quicSecret: string;
  udp: boolean | null;
  xudp: boolean | null;
  tcpFastOpen: boolean | null;
  allowInsecure: boolean | null;
  tls13: boolean | null;
  snellVersion: number;
  snellReuse: boolean | null;
  snellUserKey: string;
  snellNetwork: string;
  snellMode: string;
  snellUDPPort: number;
  shadowTLSPassword: string;
  shadowTLSSNI: string;
  shadowTLSVersion: number;
  serverName: string;
  selfIP: string;
  selfIPv6: string;
  publicKey: string;
  privateKey: string;
  preSharedKey: string;
  dnsServers: string[];
  mtu: number;
  allowedIPs: string;
  keepAlive: number;
  testUrl: string;
  clientId: string;
  wireGuardLocalAddresses: string[];
  wireGuardInterfaceName: string;
  wireGuardSystem: boolean | null;
  wireGuardListenPort: number;
  wireGuardWorkers: number;
  ports: string;
  auth: string;
  alpn: string;
  alpnList: string[];
  upMbps: string;
  downMbps: string;
  hysteriaHopInterval: string;
  insecure: string;
  fingerprint: string;
  obfsPassword: string;
  hysteria2RealmUrl: string;
  hysteria2GeckoMinPacketSize: string;
  hysteria2GeckoMaxPacketSize: string;
  hysteria2ECH: string;
  hysteria2PortsAreAdditional: boolean;
  grpcServiceName: string;
  grpcMode: string;
  shortId: string;
  flow: string;
  encryption: string;
  flowShow: boolean;
  disableSni: boolean | null;
  upSpeed: number;
  downSpeed: number;
  sni: string;
  reduceRtt: boolean | null;
  udpRelayMode: string;
  requestTimeout: number;
  token: string;
  underlyingProxy: string;
  packetEncoding: string;
  multiplexing: string;
  mieruProfile: string;
  mieruSourceId: string;
  mieruSourceRemark: string;
  mieruBindingIndex: number;
  mieruHasUnknownParameters: boolean;
  mieruHandshakeMode: string;
  mieruTrafficPattern: string;
  v2rayHttpUpgrade: boolean | null;
  canonicalProxyJson: string;
  wireGuardPeers: ProxyWireGuardPeer[];
  xrayLinkOptions: [string, string][];
}

export interface Shadowsocks extends Pick<
  ProxyNodeParameters,
  'password' | 'encryptMethod' | 'plugin' | 'pluginOption'
> {
  type: 'Shadowsocks';
}

export interface ShadowsocksR extends Pick<
  ProxyNodeParameters,
  'password' | 'encryptMethod' | 'protocol' | 'protocolParam' | 'obfs' | 'obfsParam'
> {
  type: 'ShadowsocksR';
}

export interface VMess extends Pick<
  ProxyNodeParameters,
  'userId' | 'alterId' | 'encryptMethod' | 'transferProtocol' | 'host' | 'path' | 'tlsSecure' | 'serverName'
> {
  type: 'VMess';
}

export interface Trojan extends Pick<
  ProxyNodeParameters,
  'password' | 'transferProtocol' | 'host' | 'path' | 'tlsSecure' | 'serverName' | 'alpnList'
> {
  type: 'Trojan';
}

export interface Snell extends Pick<
  ProxyNodeParameters,
  'password' | 'snellVersion' | 'snellReuse' | 'snellUserKey' | 'snellNetwork' | 'snellMode' | 'snellUDPPort'
> {
  type: 'Snell';
}

export interface HTTP extends Pick<ProxyNodeParameters, 'username' | 'password'> {
  type: 'HTTP';
}

export interface HTTPS extends Pick<
  ProxyNodeParameters,
  'username' | 'password' | 'tlsSecure' | 'serverName' | 'allowInsecure'
> {
  type: 'HTTPS';
}

export interface SOCKS5 extends Pick<ProxyNodeParameters, 'username' | 'password' | 'udp'> {
  type: 'SOCKS5';
}

export interface WireGuard extends Pick<
  ProxyNodeParameters,
  | 'privateKey'
  | 'publicKey'
  | 'preSharedKey'
  | 'selfIP'
  | 'selfIPv6'
  | 'dnsServers'
  | 'mtu'
  | 'allowedIPs'
  | 'keepAlive'
  | 'wireGuardPeers'
  | 'wireGuardLocalAddresses'
  | 'wireGuardInterfaceName'
  | 'wireGuardSystem'
  | 'wireGuardListenPort'
  | 'wireGuardWorkers'
> {
  type: 'WireGuard';
}

export interface VLESS extends Pick<
  ProxyNodeParameters,
  | 'userId'
  | 'flow'
  | 'encryption'
  | 'publicKey'
  | 'shortId'
  | 'transferProtocol'
  | 'tlsSecure'
  | 'serverName'
  | 'xrayLinkOptions'
> {
  type: 'VLESS';
}

export interface Hysteria extends Pick<
  ProxyNodeParameters,
  'authStr' | 'protocol' | 'obfs' | 'upMbps' | 'downMbps' | 'ports' | 'hysteriaHopInterval' | 'alpnList'
> {
  type: 'Hysteria';
}

export interface Hysteria2 extends Pick<
  ProxyNodeParameters,
  | 'password'
  | 'obfs'
  | 'obfsPassword'
  | 'ports'
  | 'hysteria2PortsAreAdditional'
  | 'hysteria2RealmUrl'
  | 'hysteria2GeckoMinPacketSize'
  | 'hysteria2GeckoMaxPacketSize'
  | 'hysteria2ECH'
  | 'alpnList'
> {
  type: 'Hysteria2';
}

export interface TUIC extends Pick<
  ProxyNodeParameters,
  | 'userId'
  | 'password'
  | 'token'
  | 'congestionControl'
  | 'udpRelayMode'
  | 'reduceRtt'
  | 'disableSni'
  | 'requestTimeout'
  | 'alpnList'
> {
  type: 'TUIC';
}

export interface AnyTLS extends Pick<
  ProxyNodeParameters,
  'password' | 'idleSessionCheckInterval' | 'idleSessionTimeout' | 'minIdleSession' | 'serverName'
> {
  type: 'AnyTLS';
}

export interface Naive extends Pick<
  ProxyNodeParameters,
  'username' | 'password' | 'naiveInsecureConcurrency' | 'naiveQuic' | 'naiveUot'
> {
  type: 'Naive';
}

export interface Mieru extends Pick<
  ProxyNodeParameters,
  | 'username'
  | 'password'
  | 'mieruProfile'
  | 'mieruSourceId'
  | 'mieruSourceRemark'
  | 'mieruBindingIndex'
  | 'mieruHasUnknownParameters'
  | 'mieruHandshakeMode'
  | 'mieruTrafficPattern'
> {
  type: 'Mieru';
}

export interface ProxyProtocolMap {
  Shadowsocks: Shadowsocks;
  ShadowsocksR: ShadowsocksR;
  VMess: VMess;
  Trojan: Trojan;
  Snell: Snell;
  HTTP: HTTP;
  HTTPS: HTTPS;
  SOCKS5: SOCKS5;
  WireGuard: WireGuard;
  VLESS: VLESS;
  Hysteria: Hysteria;
  Hysteria2: Hysteria2;
  TUIC: TUIC;
  AnyTLS: AnyTLS;
  Naive: Naive;
  Mieru: Mieru;
}

export type ProxyProtocol = ProxyProtocolMap[ProxyNodeType];

export type ProxyNode<T extends ProxyProtocol = ProxyProtocol> = T extends ProxyProtocol
  ? ProxyNodeParameters & T
  : never;

export type ParsedProxyNode = ProxyNode;
