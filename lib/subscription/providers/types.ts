export type PortRange = { start: number; end: number };

export type Transport = {
  kind: 'tcp' | 'ws' | 'http' | 'h2' | 'grpc' | 'quic' | 'kcp' | 'httpupgrade' | 'xhttp';
  host?: string;
  path?: string;
  edge?: string;
  headerType?: string;
  serviceName?: string;
  mode?: string;
  quicSecurity?: string;
  quicKey?: string;
};

export type Tls = {
  enabled: boolean;
  serverName?: string;
  allowInsecure?: boolean;
  disableSni?: boolean;
  tls13?: boolean;
  alpn?: string[];
  fingerprint?: string;
  reality?: { publicKey: string; shortId?: string };
  ech?: string;
};

type Endpoint = { server: string; port: number };

type CommonNode = Endpoint & {
  name: string;
  sourceId?: string;
  sourceGroup?: string;
  sourceGroupId?: string;
  transport?: Transport;
  tls?: Tls;
  udp?: boolean;
  xudp?: boolean;
  tcpFastOpen?: boolean;
  underlyingProxy?: string;
  testUrl?: string;
};

type Password = { password: string };
type Account = { username: string } & Password;
type Cipher = { method: string } & Password;
type Plugin = { name: string; options: Record<string, string | true> };
type Xray = {
  encryption: string;
  packetEncoding?: string;
  xray?: Partial<Record<'authority' | 'extra' | 'fm' | 'pcs' | 'vcn' | 'seed' | 'spx', string>>;
};

type HysteriaOptions = {
  ports: PortRange[];
  up?: string;
  down?: string;
  hopInterval?: string;
};

type WireGuardPeer = {
  endpoint: Endpoint;
  publicKey: string;
  preSharedKey?: string;
  allowedIPs?: string[];
  reserved?: number[];
  keepAlive?: number;
};

export type ShadowsocksNode = CommonNode &
  Cipher & {
    protocol: 'ss';
    plugin?: Plugin;
  };

export type ShadowsocksRNode = CommonNode &
  Cipher & {
    protocol: 'ssr';
    ssr: { protocol: string; protocolParam?: string; obfs: string; obfsParam?: string };
  };

export type VMessNode = CommonNode &
  Xray & {
    protocol: 'vmess';
    uuid: string;
    alterId: number;
  };

export type VlessNode = CommonNode &
  Xray & {
    protocol: 'vless';
    uuid: string;
    flow?: string;
  };

export type TrojanNode = CommonNode &
  Password & {
    protocol: 'trojan';
    trojanGo?: { encryption?: string; plugin?: Plugin };
    xray?: Xray['xray'];
  };

export type Socks5Node = CommonNode & Partial<Account> & { protocol: 'socks5' };

export type HttpNode = CommonNode & Partial<Account> & { protocol: 'http' };

export type HttpsNode = CommonNode & Partial<Account> & { protocol: 'https' };

export type HysteriaNode = CommonNode & {
  protocol: 'hysteria';
  hysteria: HysteriaOptions & {
    network: 'udp' | 'wechat-video' | 'faketcp';
    auth?: string;
    obfs?: 'xplus';
    obfsPassword?: string;
  };
};

export type Hysteria2Node = CommonNode & {
  protocol: 'hysteria2';
  password: string;
  hysteria2: HysteriaOptions & {
    certificatePin?: string;
    realm?: { url: string; token: string };
    obfs?: 'salamander' | 'gecko';
    obfsPassword?: string;
    gecko?: { minPacketSize?: number; maxPacketSize?: number };
  };
};

type TuicCredentials = { token: string } | ({ uuid: string } & Password);

export type TuicNode = CommonNode &
  TuicCredentials & {
    protocol: 'tuic';
    tuic: {
      congestionControl?: 'cubic' | 'new_reno' | 'bbr';
      udpRelayMode: 'native' | 'quic';
      reduceRtt?: boolean;
      requestTimeoutMs: number;
    };
  };

export type AnyTlsNode = CommonNode &
  Password & {
    protocol: 'anytls';
    anytls: { idleSessionCheckIntervalSeconds: number; idleSessionTimeoutSeconds: number; minIdleSession: number };
  };

export type NaiveNode = CommonNode &
  Password & {
    protocol: 'naive';
    username?: string;
    naive: { transport: 'https' | 'quic'; insecureConcurrency?: number; uot?: boolean };
  };

export type WireGuardNode = CommonNode & {
  protocol: 'wireguard';
  wireguard: {
    privateKey: string;
    addresses: string[];
    peers: [WireGuardPeer];
    dns?: string[];
    mtu?: number;
    interfaceName?: string;
    system?: boolean;
    listenPort?: number;
    workers?: number;
  };
};

export type MieruNode = CommonNode &
  Account & {
    protocol: 'mieru';
    mieru: {
      profile: string;
      bindings: (PortRange & { transport: 'TCP' | 'UDP' })[];
      multiplexing?: string;
      handshakeMode?: string;
      trafficPattern?: string;
      hasUnknownParameters: boolean;
      mtu?: number;
    };
  };

export type ProviderNode =
  | ShadowsocksNode
  | ShadowsocksRNode
  | VMessNode
  | VlessNode
  | TrojanNode
  | Socks5Node
  | HttpNode
  | HttpsNode
  | HysteriaNode
  | Hysteria2Node
  | TuicNode
  | AnyTlsNode
  | NaiveNode
  | WireGuardNode
  | MieruNode;
