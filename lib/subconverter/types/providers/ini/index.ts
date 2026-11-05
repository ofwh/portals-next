export interface IniProxyOptions {
  uuid?: string;
  ws?: string;
  overTls?: string;
  protocol?: string;
  protocolParam?: string;
  congestionController?: string;
  udpRelayMode?: string;
  aead?: string;
  alpn?: string;
  alterid?: string;
  blockQuic?: string;
  custom?: string;
  direct?: string;
  dns?: string;
  dnsServer?: string;
  dnsv6?: string;
  downloadBandwidth?: string;
  encryptMethod?: string;
  fastOpen?: string;
  fingerprint?: string;
  flow?: string;
  fp?: string;
  grpcMode?: string;
  host?: string;
  interfaceIp?: string;
  interfaceIpV6?: string;
  interfaceIpv6?: string;
  keepalive?: string;
  method?: string;
  mode?: string;
  mtu?: string;
  obfs?: string;
  obfsHost?: string;
  obfsParam?: string;
  obfsUri?: string;
  password?: string;
  path?: string;
  peer?: string;
  peers?: string;
  preSharedKey?: string;
  presharedKey?: string;
  privateKey?: string;
  psk?: string;
  publicKey?: string;
  realityBase64Pubkey?: string;
  realityHexShortid?: string;
  reject?: string;
  rejectTinygif?: string;
  reuse?: string;
  salamanderPassword?: string;
  sectionName?: string;
  selfIp?: string;
  selfIpv6?: string;
  selfIpV6?: string;
  serviceName?: string;
  shadowTlsPassword?: string;
  shadowTlsSni?: string;
  shadowTlsVersion?: string;
  shortId?: string;
  skipCertVerify?: string;
  sni?: string;
  ssrProtocol?: string;
  ssrProtocolParam?: string;
  tag?: string;
  testUrl?: string;
  tfo?: string;
  tls?: string;
  tlsAlpn?: string;
  tlsCertSha256?: string;
  tlsHost?: string;
  tlsName?: string;
  tlsProfile?: string;
  tlsPubkeySha256?: string;
  tlsVerification?: string;
  tls13?: string;
  transport?: string;
  udp?: string;
  udpPort?: string;
  udpRelay?: string;
  username?: string;
  version?: string;
  vlessFlow?: string;
  vmessAead?: string;
  wsHeaders?: string;
  wsPath?: string;
  pluginPath?: string;
  pluginTls?: string;
  token?: string;
  geckoPassword?: string;
  portHopping?: string;
  serverPorts?: string;
  hopInterval?: string;
  portHoppingInterval?: string;
  serverCertFingerprintSha256?: string;
  underlyingProxy?: string;
  interface?: string;
}

export interface IniProxyNode {
  name: string;
  type: string;
  arguments: Array<string>;
  options: IniProxyOptions;
  raw?: string;
  layout?: 'named' | 'positional' | 'endpoint';
  wireGuard?: IniWireGuardSettings;
}

export interface IniSection {
  name: string;
  lines: Array<string>;
}

export interface IniConfig {
  sections: Array<IniSection>;
  proxies: Array<IniProxyNode>;
}

export type { IniNodeFields } from './fields';

export interface IniWireGuardPeer {
  server: string;
  port: number;
  publicKey: string;
  preSharedKey?: string;
  allowedIps?: string[];
  reserved?: number[];
  keepAlive?: number;
}

export interface IniWireGuardSettings {
  privateKey: string;
  addresses: string[];
  peers: IniWireGuardPeer[];
  mtu?: number;
  dnsServers?: string[];
  keepAlive?: number;
}

type IniNodeType =
  | 'ss'
  | 'shadowsocks'
  | 'ssr'
  | 'shadowsocksr'
  | 'vmess'
  | 'vless'
  | 'trojan'
  | 'snell'
  | 'http'
  | 'https'
  | 'socks'
  | 'socks5'
  | 'socks5-tls'
  | 'wireguard'
  | 'hysteria2'
  | 'tuic'
  | 'tuic-v5'
  | 'anytls';
type IniProtocolNodes = { [T in IniNodeType]: Omit<IniProxyNode, 'type'> & { type: T } };
export type IniNode = IniProtocolNodes[IniNodeType];
