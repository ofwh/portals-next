export interface ClashAnyTLSProxyNode {
  name: string;
  type: 'anytls';
  port: string | number;
  server: string;
  alpn?: Array<string>;
  certificate?: string;
  clientFingerprint?: string;
  clientMetadata?: string;
  dialerProxy?: string;
  disableReuse?: boolean;
  echOpts?: ClashECHOptions;
  fingerprint?: string;
  idleSessionCheckInterval?: number;
  idleSessionTimeout?: number;
  interfaceName?: string;
  ipVersion?: string;
  jlsOpts?: ClashJLSOptions;
  minIdleSession?: number;
  mptcp?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  restlsOpts?: ClashRestlsOptions;
  routingMark?: number;
  shadowTlsOpts?: ClashShadowTLSOptions;
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  udp?: boolean;
}

export interface ClashEasytierProxyNode {
  name: string;
  type: 'easytier';
  acceptDns?: boolean;
  dhcp?: boolean;
  dialerProxy?: string;
  disableKcpInput?: boolean;
  disableP2p?: boolean;
  disableQuicInput?: boolean;
  enableEncryption?: boolean;
  enableExitNode?: boolean;
  enableKcpProxy?: boolean;
  enableQuicProxy?: boolean;
  encryptionAlgorithm?: string;
  exitNodes?: Array<string>;
  hostname?: string;
  instanceName?: string;
  interfaceName?: string;
  ipVersion?: string;
  ipv4?: string;
  latencyFirst?: boolean;
  listeners?: Array<string>;
  localPrivateKey?: string;
  localPublicKey?: string;
  mappedListeners?: Array<string>;
  mptcp?: boolean;
  mtu?: number;
  networkName?: string;
  networkSecret?: string;
  noListener?: boolean;
  peers?: Array<string>;
  privateMode?: boolean;
  proxyNetworks?: Array<string>;
  routingMark?: number;
  secureMode?: boolean;
  stateDir?: string;
  tfo?: boolean;
  tldDnsZone?: string;
  udp?: boolean;
}

export interface ClashGostRelayProxyNode {
  name: string;
  type: 'gost-relay';
  port: string | number;
  server: string;
  certificate?: string;
  clientFingerprint?: string;
  dialerProxy?: string;
  fingerprint?: string;
  forward?: boolean;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  mux?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  routingMark?: number;
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  tls?: boolean;
  udp?: boolean;
  username?: string;
}

export interface ClashHTTPProxyNodeHeadersItem {
  name: string;
  value: string;
}

export interface ClashHTTPProxyNode {
  name: string;
  type: 'http';
  port: string | number;
  server: string;
  certificate?: string;
  dialerProxy?: string;
  fingerprint?: string;
  headers?: Array<ClashHTTPProxyNodeHeadersItem>;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  routingMark?: number;
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  tls?: boolean;
  username?: string;
}

export interface ClashHysteriaProxyNode {
  name: string;
  type: 'hysteria';
  server: string;
  alpn?: Array<string>;
  auth?: string;
  authStr?: string;
  certificate?: string;
  dialerProxy?: string;
  disableMtuDiscovery?: boolean;
  down?: string;
  downSpeed?: number;
  echOpts?: ClashECHOptions;
  fastOpen?: boolean;
  fingerprint?: string;
  hopInterval?: number;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  nameCertVerify?: string;
  obfs?: string;
  obfsProtocol?: string;
  port?: string | number;
  ports?: string;
  privateKey?: string;
  protocol?: string;
  recvWindow?: number;
  recvWindowConn?: number;
  routingMark?: number;
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  up?: string;
  upSpeed?: number;
}

export interface ClashHysteria2ProxyNode {
  name: string;
  type: 'hysteria2';
  server: string;
  alpn?: Array<string>;
  bbrProfile?: string;
  certificate?: string;
  cwnd?: number;
  dialerProxy?: string;
  down?: string;
  echOpts?: ClashECHOptions;
  fingerprint?: string;
  handshakeTimeout?: number;
  hopInterval?: string;
  initialConnectionReceiveWindow?: number;
  initialStreamReceiveWindow?: number;
  interfaceName?: string;
  ipVersion?: string;
  maxConnectionReceiveWindow?: number;
  maxStreamReceiveWindow?: number;
  mptcp?: boolean;
  nameCertVerify?: string;
  obfs?: string;
  obfsMaxPacketSize?: number;
  obfsMinPacketSize?: number;
  obfsPassword?: string;
  password?: string;
  port?: string | number;
  ports?: string;
  privateKey?: string;
  realmOpts?: ClashHysteria2RealmOption;
  routingMark?: number;
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  udpMtu?: number;
  up?: string;
}

export interface ClashMasqueProxyNode {
  name: string;
  type: 'masque';
  port: string | number;
  server: string;
  bbrProfile?: string;
  congestionController?: string;
  cwnd?: number;
  dialerProxy?: string;
  dns?: Array<string>;
  handshakeTimeout?: number;
  interfaceName?: string;
  ip?: string;
  ipStack?: ClashIPStackOption;
  ipVersion?: string;
  ipv6?: string;
  mptcp?: boolean;
  mtu?: number;
  nameCertVerify?: string;
  network?: string;
  privateKey?: string;
  publicKey?: string;
  remoteDnsResolve?: boolean;
  routingMark?: number;
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  udp?: boolean;
  uri?: string;
}

export interface ClashMieruProxyNode {
  name: string;
  type: 'mieru';
  server: string;
  dialerProxy?: string;
  handshakeMode?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  multiplexing?: string;
  password?: string;
  port?: string | number;
  portRange?: string;
  routingMark?: number;
  tfo?: boolean;
  trafficPattern?: string;
  transport?: string;
  udp?: boolean;
  username?: string;
}

export interface ClashOpenvpnProxyNode {
  name: string;
  type: 'openvpn';
  port: string | number;
  server: string;
  auth?: string;
  ca?: string;
  cert?: string;
  cipher?: string;
  compLzo?: string;
  dataCiphers?: Array<string>;
  dataCiphersFallback?: string;
  dev?: string;
  dialerProxy?: string;
  dns?: Array<string>;
  handshakeTimeout?: number;
  interfaceName?: string;
  ipStack?: ClashIPStackOption;
  ipVersion?: string;
  key?: string;
  keyDirection?: string;
  mptcp?: boolean;
  mtu?: number;
  password?: string;
  peerInfo?: Array<ClashHTTPProxyNodeHeadersItem>;
  ping?: number;
  pingRestart?: number;
  proto?: string;
  remoteDnsResolve?: boolean;
  routingMark?: number;
  tfo?: boolean;
  tlsAuth?: string;
  tlsCrypt?: string;
  tlsCryptV2?: string;
  tranWindow?: number;
  udp?: boolean;
  username?: string;
}

export interface ClashShadowquicProxyNode {
  name: string;
  type: 'shadowquic';
  port: string | number;
  server: string;
  alpn?: Array<string>;
  bbrProfile?: string;
  congestionController?: string;
  cwnd?: number;
  dialerProxy?: string;
  disableMtuDiscovery?: boolean;
  down?: string;
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
  sni?: string;
  tfo?: boolean;
  udpOverStream?: boolean;
  up?: string;
  username?: string;
  zeroRtt?: boolean;
}

export interface ClashSnellProxyNode {
  name: string;
  type: 'snell';
  port: string | number;
  server: string;
  clientFingerprint?: string;
  dialerProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  obfsOpts?: ClashObfsOptions;
  psk?: string;
  reuse?: boolean;
  routingMark?: number;
  tfo?: boolean;
  udp?: boolean;
  version?: number;
}

export interface ClashSOCKS5ProxyNode {
  name: string;
  type: 'socks5';
  port: string | number;
  server: string;
  certificate?: string;
  dialerProxy?: string;
  fingerprint?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  nameCertVerify?: string;
  password?: string;
  privateKey?: string;
  routingMark?: number;
  skipCertVerify?: boolean;
  tfo?: boolean;
  tls?: boolean;
  udp?: boolean;
  username?: string;
}

export interface ClashShadowsocksProxyNode {
  name: string;
  type: 'ss';
  port: string | number;
  server: string;
  cipher?: string;
  clientFingerprint?: string;
  dialerProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  password?: string;
  plugin?: string;
  pluginOpts?: ClashPluginOptions;
  routingMark?: number;
  tfo?: boolean;
  udp?: boolean;
  udpOverTcp?: boolean;
  udpOverTcpVersion?: number;
}

export interface ClashSshProxyNode {
  name: string;
  type: 'ssh';
  port: string | number;
  server: string;
  dialerProxy?: string;
  hostKey?: Array<string>;
  hostKeyAlgorithms?: Array<string>;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  password?: string;
  privateKey?: string;
  privateKeyPassphrase?: string;
  routingMark?: number;
  tfo?: boolean;
  username?: string;
}

export interface ClashShadowsocksRProxyNode {
  name: string;
  type: 'ssr';
  port: string | number;
  server: string;
  cipher?: string;
  dialerProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  obfs?: string;
  obfsParam?: string;
  password?: string;
  protocol?: string;
  protocolParam?: string;
  routingMark?: number;
  tfo?: boolean;
  udp?: boolean;
}

export interface ClashSudokuProxyNode {
  name: string;
  type: 'sudoku';
  port: string | number;
  server: string;
  aeadMethod?: string;
  customTable?: string;
  customTables?: Array<string>;
  dialerProxy?: string;
  enablePureDownlink?: boolean;
  httpMask?: boolean;
  httpMaskHost?: string;
  httpMaskMode?: string;
  httpMaskMultiplex?: string;
  httpMaskTls?: boolean;
  httpmask?: ClashSudokuHTTPMaskOptions;
  interfaceName?: string;
  ipVersion?: string;
  key?: string;
  mptcp?: boolean;
  multiplex?: string;
  paddingMax?: number;
  paddingMin?: number;
  pathRoot?: string;
  routingMark?: number;
  tableType?: string;
  tfo?: boolean;
}

export interface ClashTailscaleProxyNode {
  name: string;
  type: 'tailscale';
  acceptRoutes?: boolean;
  authKey?: string;
  controlUrl?: string;
  dialerProxy?: string;
  ephemeral?: boolean;
  exitNode?: string;
  exitNodeAllowLanAccess?: boolean;
  hostname?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  routingMark?: number;
  stateDir?: string;
  tfo?: boolean;
  udp?: boolean;
}

export interface ClashTrojanProxyNode {
  name: string;
  type: 'trojan';
  port: string | number;
  server: string;
  alpn?: Array<string>;
  certificate?: string;
  clientFingerprint?: string;
  dialerProxy?: string;
  echOpts?: ClashECHOptions;
  fingerprint?: string;
  grpcOpts?: ClashGrpcOptions;
  interfaceName?: string;
  ipVersion?: string;
  jlsOpts?: ClashJLSOptions;
  mptcp?: boolean;
  nameCertVerify?: string;
  network?: string;
  password?: string;
  privateKey?: string;
  realityOpts?: ClashRealityOptions;
  restlsOpts?: ClashRestlsOptions;
  routingMark?: number;
  shadowTlsOpts?: ClashShadowTLSOptions;
  skipCertVerify?: boolean;
  sni?: string;
  ssOpts?: ClashTrojanSSOption;
  tfo?: boolean;
  udp?: boolean;
  wsOpts?: ClashWSOptions;
}

export interface ClashTrusttunnelProxyNode {
  name: string;
  type: 'trusttunnel';
  port: string | number;
  server: string;
  alpn?: Array<string>;
  bbrProfile?: string;
  certificate?: string;
  clientFingerprint?: string;
  congestionController?: string;
  cwnd?: number;
  dialerProxy?: string;
  echOpts?: ClashECHOptions;
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
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  udp?: boolean;
  username?: string;
}

export interface ClashTUICProxyNode {
  name: string;
  type: 'tuic';
  port: string | number;
  server: string;
  alpn?: Array<string>;
  bbrProfile?: string;
  certificate?: string;
  congestionController?: string;
  cwnd?: number;
  dialerProxy?: string;
  disableMtuDiscovery?: boolean;
  disableSni?: boolean;
  echOpts?: ClashECHOptions;
  fastOpen?: boolean;
  fingerprint?: string;
  heartbeatInterval?: number;
  interfaceName?: string;
  ip?: string;
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
  skipCertVerify?: boolean;
  sni?: string;
  tfo?: boolean;
  token?: string;
  udpOverStream?: boolean;
  udpOverStreamVersion?: number;
  udpRelayMode?: string;
  uuid?: string;
}

export interface ClashVLESSProxyNode {
  name: string;
  type: 'vless';
  port: string | number;
  server: string;
  alpn?: Array<string>;
  certificate?: string;
  clientFingerprint?: string;
  dialerProxy?: string;
  echOpts?: ClashECHOptions;
  encryption?: string;
  fingerprint?: string;
  flow?: string;
  grpcOpts?: ClashGrpcOptions;
  h2Opts?: ClashHTTP2Options;
  httpOpts?: ClashHTTPOptions;
  interfaceName?: string;
  ipVersion?: string;
  jlsOpts?: ClashJLSOptions;
  mptcp?: boolean;
  nameCertVerify?: string;
  network?: string;
  packetAddr?: boolean;
  packetEncoding?: string;
  privateKey?: string;
  realityOpts?: ClashRealityOptions;
  restlsOpts?: ClashRestlsOptions;
  routingMark?: number;
  servername?: string;
  shadowTlsOpts?: ClashShadowTLSOptions;
  skipCertVerify?: boolean;
  tfo?: boolean;
  tls?: boolean;
  udp?: boolean;
  uuid?: string;
  wsHeaders?: Array<ClashHTTPProxyNodeHeadersItem>;
  wsOpts?: ClashWSOptions;
  xhttpOpts?: ClashXHTTPOptions;
  xudp?: boolean;
}

export interface ClashVMessProxyNode {
  name: string;
  type: 'vmess';
  port: string | number;
  server: string;
  alpn?: Array<string>;
  alterId?: number;
  authenticatedLength?: boolean;
  certificate?: string;
  cipher?: string;
  clientFingerprint?: string;
  dialerProxy?: string;
  echOpts?: ClashECHOptions;
  fingerprint?: string;
  globalPadding?: boolean;
  grpcOpts?: ClashGrpcOptions;
  h2Opts?: ClashHTTP2Options;
  httpOpts?: ClashHTTPOptions;
  interfaceName?: string;
  ipVersion?: string;
  jlsOpts?: ClashJLSOptions;
  mekyaOpts?: ClashMekyaOptions;
  mkcpOpts?: ClashMKCPOptions;
  mptcp?: boolean;
  nameCertVerify?: string;
  network?: string;
  packetAddr?: boolean;
  packetEncoding?: string;
  privateKey?: string;
  realityOpts?: ClashRealityOptions;
  restlsOpts?: ClashRestlsOptions;
  routingMark?: number;
  servername?: string;
  shadowTlsOpts?: ClashShadowTLSOptions;
  skipCertVerify?: boolean;
  tfo?: boolean;
  tls?: boolean;
  tlsmirrorOpts?: ClashTLSMirrorOptions;
  udp?: boolean;
  uuid?: string;
  wsOpts?: ClashWSOptions;
  xudp?: boolean;
}

export interface ClashWireGuardProxyNode {
  name: string;
  type: 'wireguard';
  allowedIps?: Array<string>;
  amneziaWgOption?: ClashAmneziaWGOption;
  dialerProxy?: string;
  dns?: Array<string>;
  interfaceName?: string;
  ip?: string;
  ipStack?: ClashIPStackOption;
  ipVersion?: string;
  ipv6?: string;
  mptcp?: boolean;
  mtu?: number;
  peers?: Array<ClashWireGuardPeerOption>;
  persistentKeepalive?: number;
  port?: string | number;
  preSharedKey?: string;
  privateKey?: string;
  publicKey?: string;
  refreshServerIpInterval?: number;
  remoteDnsResolve?: boolean;
  reserved?: Array<number>;
  routingMark?: number;
  server?: string;
  tfo?: boolean;
  udp?: boolean;
  workers?: number;
}

export interface ClashZerotierProxyNode {
  name: string;
  type: 'zerotier';
  dialerProxy?: string;
  dns?: Array<string>;
  encryptedHello?: boolean;
  identitySecret?: string;
  interfaceName?: string;
  ipStack?: ClashIPStackOption;
  ipVersion?: string;
  lowBandwidth?: boolean;
  mptcp?: boolean;
  mtu?: number;
  network?: string;
  orbit?: Array<ClashZeroTierOrbitOption>;
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
  tfo?: boolean;
  udp?: boolean;
}

export type ClashProxyNode =
  | ClashAnyTLSProxyNode
  | ClashEasytierProxyNode
  | ClashGostRelayProxyNode
  | ClashHTTPProxyNode
  | ClashHysteriaProxyNode
  | ClashHysteria2ProxyNode
  | ClashMasqueProxyNode
  | ClashMieruProxyNode
  | ClashOpenvpnProxyNode
  | ClashShadowquicProxyNode
  | ClashSnellProxyNode
  | ClashSOCKS5ProxyNode
  | ClashShadowsocksProxyNode
  | ClashSshProxyNode
  | ClashShadowsocksRProxyNode
  | ClashSudokuProxyNode
  | ClashTailscaleProxyNode
  | ClashTrojanProxyNode
  | ClashTrusttunnelProxyNode
  | ClashTUICProxyNode
  | ClashVLESSProxyNode
  | ClashVMessProxyNode
  | ClashWireGuardProxyNode
  | ClashZerotierProxyNode;

export interface ClashDirectAction {
  name: string;
  type: 'direct';
  dialerProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  routingMark?: number;
  tfo?: boolean;
}

export interface ClashDNSAction {
  name: string;
  type: 'dns';
  dialerProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  routingMark?: number;
  tfo?: boolean;
}

export interface ClashRejectAction {
  name: string;
  type: 'reject';
  dialerProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  routingMark?: number;
  tfo?: boolean;
}

export interface ClashRematchAction {
  name: string;
  type: 'rematch';
  dialerProxy?: string;
  interfaceName?: string;
  ipVersion?: string;
  mptcp?: boolean;
  routingMark?: number;
  targetRematchName?: string;
  targetSubRule?: string;
  tfo?: boolean;
}

export type ClashAction = ClashDirectAction | ClashDNSAction | ClashRejectAction | ClashRematchAction;

export type ClashEntry =
  | ClashAnyTLSProxyNode
  | ClashEasytierProxyNode
  | ClashGostRelayProxyNode
  | ClashHTTPProxyNode
  | ClashHysteriaProxyNode
  | ClashHysteria2ProxyNode
  | ClashMasqueProxyNode
  | ClashMieruProxyNode
  | ClashOpenvpnProxyNode
  | ClashShadowquicProxyNode
  | ClashSnellProxyNode
  | ClashSOCKS5ProxyNode
  | ClashShadowsocksProxyNode
  | ClashSshProxyNode
  | ClashShadowsocksRProxyNode
  | ClashSudokuProxyNode
  | ClashTailscaleProxyNode
  | ClashTrojanProxyNode
  | ClashTrusttunnelProxyNode
  | ClashTUICProxyNode
  | ClashVLESSProxyNode
  | ClashVMessProxyNode
  | ClashWireGuardProxyNode
  | ClashZerotierProxyNode
  | ClashDirectAction
  | ClashDNSAction
  | ClashRejectAction
  | ClashRematchAction;

export interface ClashConfigVariant1 {
  proxies: Array<ClashEntry>;
  proxy?: Array<ClashEntry>;
}

export interface ClashConfigVariant2 {
  proxy: Array<ClashEntry>;
  proxies?: Array<ClashEntry>;
}

export type ClashConfig = ClashConfigVariant1 | ClashConfigVariant2;

export interface ClashECHOptions {
  enable?: boolean;
  config?: string;
  queryServerName?: string;
}

export interface ClashJLSOptions {
  username?: string;
  password?: string;
}

export interface ClashRestlsOptions {
  password?: string;
  versionHint?: string;
  restlsScript?: string;
}

export interface ClashShadowTLSOptions {
  password?: string;
  version?: number;
}

export interface ClashHysteria2RealmOption {
  enable?: boolean;
  serverUrl?: string;
  token?: string;
  realmId?: string;
  stunServers?: Array<string>;
  sni?: string;
  skipCertVerify?: boolean;
  nameCertVerify?: string;
  fingerprint?: string;
  certificate?: string;
  privateKey?: string;
  alpn?: Array<string>;
}

export interface ClashIPStackOption {
  mode?: string;
  congestionController?: string;
}

export interface ClashSudokuHTTPMaskOptions {
  disable?: boolean;
  mode?: string;
  tls?: boolean;
  host?: string;
  pathRoot?: string;
  multiplex?: string;
}

export interface ClashGrpcOptions {
  grpcServiceName?: string;
  grpcUserAgent?: string;
  pingInterval?: number;
  maxConnections?: number;
  minStreams?: number;
  maxStreams?: number;
}

export interface ClashRealityOptions {
  publicKey?: string;
  shortId?: string;
  supportX25519mlkem768?: boolean;
}

export interface ClashTrojanSSOption {
  enabled?: boolean;
  method?: string;
  password?: string;
}

export interface ClashWSOptions {
  path?: string;
  headers?: Array<ClashHTTPProxyNodeHeadersItem>;
  maxEarlyData?: number;
  earlyDataHeaderName?: string;
  v2rayHttpUpgrade?: boolean;
  v2rayHttpUpgradeFastOpen?: boolean;
}

export interface ClashHTTP2Options {
  host?: Array<string>;
  path?: string;
}

export interface ClashHTTPOptionsHeadersItem {
  name: string;
  value: Array<string>;
}

export interface ClashHTTPOptions {
  method?: string;
  path?: Array<string>;
  headers?: Array<ClashHTTPOptionsHeadersItem>;
}

export interface ClashXHTTPReuseSettings {
  maxConcurrency?: string;
  maxConnections?: string;
  cMaxReuseTimes?: string;
  hMaxRequestTimes?: string;
  hMaxReusableSecs?: string;
  hKeepAlivePeriod?: number;
}

export interface ClashXHTTPDownloadSettings {
  path?: string;
  host?: string;
  headers?: Array<ClashHTTPProxyNodeHeadersItem>;
  reuseSettings?: ClashXHTTPReuseSettings;
  server?: string;
  port?: number;
  tls?: boolean;
  alpn?: Array<string>;
  echOpts?: ClashECHOptions;
  shadowTlsOpts?: ClashShadowTLSOptions;
  restlsOpts?: ClashRestlsOptions;
  jlsOpts?: ClashJLSOptions;
  realityOpts?: ClashRealityOptions;
  skipCertVerify?: boolean;
  nameCertVerify?: string;
  fingerprint?: string;
  certificate?: string;
  privateKey?: string;
  servername?: string;
  clientFingerprint?: string;
}

export interface ClashXHTTPOptions {
  path?: string;
  host?: string;
  mode?: string;
  headers?: Array<ClashHTTPProxyNodeHeadersItem>;
  noGrpcHeader?: boolean;
  xPaddingBytes?: string;
  xPaddingObfsMode?: boolean;
  xPaddingKey?: string;
  xPaddingHeader?: string;
  xPaddingPlacement?: string;
  xPaddingMethod?: string;
  uplinkHttpMethod?: string;
  sessionPlacement?: string;
  sessionKey?: string;
  sessionTable?: string;
  sessionLength?: string;
  seqPlacement?: string;
  seqKey?: string;
  uplinkDataPlacement?: string;
  uplinkDataKey?: string;
  uplinkChunkSize?: string;
  scMaxEachPostBytes?: string;
  scMinPostsIntervalMs?: string;
  reuseSettings?: ClashXHTTPReuseSettings;
  downloadSettings?: ClashXHTTPDownloadSettings;
}

export interface ClashMKCPOptions {
  mtu?: number;
  tti?: number;
  uplinkCapacity?: number;
  downlinkCapacity?: number;
  congestion?: boolean;
  writeBuffer?: number;
  readBuffer?: number;
  seed?: string;
  header?: string;
}

export interface ClashMekyaOptions {
  url?: string;
  h2PoolSize?: number;
  maxWriteDelay?: number;
  maxRequestSize?: number;
  pollingIntervalInitial?: number;
  maxWriteSize?: number;
  maxWriteDurationMs?: number;
  maxSimultaneousWriteConnection?: number;
  packetWritingBuffer?: number;
  kcp?: ClashMKCPOptions;
}

export interface ClashTLSMirrorTimeSpec {
  baseNanoseconds?: number;
  uniformRandomMultiplierNanoseconds?: number;
}

export interface ClashTLSMirrorTransportLayerPadding {
  enabled?: boolean;
}

export interface ClashTLSMirrorConnectionEnrolment {
  primaryIngressOutbound?: string;
  primaryEgressOutbound?: string;
}

export interface ClashTLSMirrorTrafficHeader {
  name?: string;
  value?: string;
  values?: Array<string>;
}

export interface ClashTLSMirrorTrafficTransferCandidate {
  weight?: number;
  gotoLocation?: number;
}

export interface ClashTLSMirrorTrafficStep {
  name?: string;
  host?: string;
  path?: string;
  method?: string;
  headers?: Array<ClashTLSMirrorTrafficHeader>;
  nextStep?: Array<ClashTLSMirrorTrafficTransferCandidate>;
  connectionReady?: boolean;
  connectionRecallExit?: boolean;
  waitTime?: ClashTLSMirrorTimeSpec;
  h2DoNotWaitForDownloadFinish?: boolean;
}

export interface ClashTLSMirrorTrafficGenerator {
  steps?: Array<ClashTLSMirrorTrafficStep>;
}

export interface ClashTLSMirrorOptions {
  primaryKey?: string;
  explicitNonceCiphersuites?: Array<number>;
  deferInstanceDerivedWriteTime?: ClashTLSMirrorTimeSpec;
  transportLayerPadding?: ClashTLSMirrorTransportLayerPadding;
  connectionEnrolment?: ClashTLSMirrorConnectionEnrolment;
  embeddedTrafficGenerator?: ClashTLSMirrorTrafficGenerator;
  sequenceWatermarkingEnabled?: boolean;
}

export interface ClashAmneziaWGOption {
  version?: number;
  jc?: number;
  jmin?: number;
  jmax?: number;
  s1?: number;
  s2?: number;
  s3?: number;
  s4?: number;
  h1?: string;
  h2?: string;
  h3?: string;
  h4?: string;
  i1?: string;
  i2?: string;
  i3?: string;
  i4?: string;
  i5?: string;
  j1?: string;
  j2?: string;
  j3?: string;
  itime?: number;
  headerProtectionKey?: string;
  contentPaddingAddition?: string;
  rekeyAfterTime?: string;
  rekeyTimeout?: string;
  rejectAfterTime?: string;
  keepaliveTimeout?: string;
  maxHandshakeAttempts?: string;
  randomTrailers?: boolean;
  disableCookies?: boolean;
}

export interface ClashWireGuardPeerOption {
  server?: string;
  port?: number;
  publicKey?: string;
  preSharedKey?: string;
  reserved?: Array<number>;
  allowedIps?: Array<string>;
}

export interface ClashZeroTierOrbitOption {
  world?: string;
  seed?: string;
}

export interface ClashPluginOptions {
  mode?: string;
  host?: string;
  path?: string;
  tls?: boolean;
  echOpts?: ClashECHOptions;
  fingerprint?: string;
  certificate?: string;
  privateKey?: string;
  headers?: Array<ClashHTTPProxyNodeHeadersItem>;
  skipCertVerify?: boolean;
  nameCertVerify?: string;
  mux?: boolean;
  v2rayHttpUpgrade?: boolean;
  v2rayHttpUpgradeFastOpen?: boolean;
  password?: string;
  version?: number;
  alpn?: Array<string>;
  versionHint?: string;
  restlsScript?: string;
  forceTls12?: boolean;
  username?: string;
  key?: string;
  crypt?: string;
  conn?: number;
  autoexpire?: number;
  scavengettl?: number;
  mtu?: number;
  ratelimit?: number;
  sndwnd?: number;
  rcvwnd?: number;
  datashard?: number;
  parityshard?: number;
  dscp?: number;
  nocomp?: boolean;
  acknodelay?: boolean;
  nodelay?: number;
  interval?: number;
  resend?: number;
  nc?: number;
  sockbuf?: number;
  smuxver?: number;
  smuxbuf?: number;
  framesize?: number;
  streambuf?: number;
  keepalive?: number;
}

export interface ClashObfsOptions {
  mode?: string;
  host?: string;
  password?: string;
  version?: number;
  alpn?: Array<string>;
}

export type { ClashNodeFields } from './fields';

export type ClashNode = ClashProxyNode;
