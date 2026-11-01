export interface ClashProxy {
  [key: string]: unknown;
  name: string;
  type: string;
  server: string;
  port: number;
  password?: string;
  psk?: string;
  version?: number;
  protocol?: string;
  'protocol-param'?: string;
  obfs?: string;
  'obfs-param'?: string;
  'obfs-password'?: string;
  'auth-str'?: string;
  up?: string | number;
  down?: string | number;
  ports?: string;
  flow?: string;
  plugin?: string;
  'plugin-opts'?: Record<string, string | number | boolean>;
  'private-key'?: string;
  'public-key'?: string;
  'pre-shared-key'?: string;
  ip?: string;
  ipv6?: string;
  mtu?: number;
  dns?: string[];
  peers?: {
    server: string;
    port: number;
    'public-key': string;
    'pre-shared-key'?: string;
    'allowed-ips'?: string[];
    reserved?: number[];
  }[];
  token?: string;
  'congestion-controller'?: string;
  'udp-relay-mode'?: string;
  'idle-session-check-interval'?: number;
  'idle-session-timeout'?: number;
  'min-idle-session'?: number;
  username?: string;
  cipher?: string;
  uuid?: string;
  alterId?: number;
  tls?: boolean;
  servername?: string;
  sni?: string;
  network?: string;
  udp?: boolean;
  'skip-cert-verify'?: boolean;
  'client-fingerprint'?: string;
  alpn?: string[];
  'ws-opts'?: {
    path?: string;
    headers?: Record<string, string>;
    'max-early-data'?: number;
    'early-data-header-name'?: string;
  };
  'grpc-opts'?: { 'grpc-service-name'?: string };
  'http-opts'?: { path?: string[]; headers?: Record<string, string[]> };
  'h2-opts'?: { path?: string; host?: string[] };
  'reality-opts'?: { 'public-key'?: string; 'short-id'?: string };
}

export interface ClashConfig {
  [key: string]: unknown;
  proxies?: ClashProxy[];
  Proxy?: ClashProxy[];
  'proxy-groups'?: ClashProxyGroup[];
  rules?: string[];
  'rule-providers'?: Record<string, ClashRuleProvider>;
}

export interface ClashProxyGroup {
  [key: string]: unknown;
  name: string;
  type: string;
  proxies?: string[];
  use?: string[];
}
export interface ClashRuleProvider {
  [key: string]: unknown;
  type: 'inline' | 'http' | 'file';
  behavior: 'domain' | 'ipcidr' | 'classical';
  payload?: string[];
  url?: string;
  path?: string;
  interval?: number;
}
