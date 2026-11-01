export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

export type SubscriptionNodeBase = {
  name: string;
  server: string;
  port: number;
  udp?: boolean;
  tfo?: boolean;
  'skip-cert-verify'?: boolean;
};
export type TlsOptions = {
  tls?: boolean;
  sni?: string;
  servername?: string;
  alpn?: string[];
  fingerprint?: string;
  'client-fingerprint'?: string;
};
export type TransportOptions = {
  network?: string;
  'ws-opts'?: {
    path?: string;
    headers?: Record<string, string>;
    'max-early-data'?: number;
    'early-data-header-name'?: string;
  };
  'grpc-opts'?: { 'grpc-service-name'?: string };
  'http-opts'?: { path?: string[]; headers?: Record<string, string[]> };
  'h2-opts'?: { path?: string; host?: string[] };
};
export type ShadowsocksNode = SubscriptionNodeBase & {
  type: 'ss';
  cipher: string;
  password: string;
  plugin?: string;
  'plugin-opts'?: Record<string, Json>;
};
export type VmessNode = SubscriptionNodeBase &
  TlsOptions &
  TransportOptions & {
    type: 'vmess';
    uuid: string;
    alterId?: number;
    cipher?: string;
  };
export type VlessNode = SubscriptionNodeBase &
  TlsOptions &
  TransportOptions & {
    type: 'vless';
    uuid: string;
    flow?: string;
    'reality-opts'?: { 'public-key'?: string; 'short-id'?: string };
  };
export type TrojanNode = SubscriptionNodeBase & TlsOptions & TransportOptions & { type: 'trojan'; password: string };
export type HysteriaNode = SubscriptionNodeBase &
  TlsOptions & {
    type: 'hysteria';
    'auth-str'?: string;
    protocol?: 'udp' | 'wechat-video' | 'faketcp';
    up: string | number;
    down: string | number;
    obfs?: string;
    ports?: string;
  };
export type Hysteria2Node = SubscriptionNodeBase &
  TlsOptions & {
    type: 'hysteria2';
    password: string;
    ports?: string;
    obfs?: string;
    'obfs-password'?: string;
  };
export type AnytlsNode = SubscriptionNodeBase &
  TlsOptions & {
    type: 'anytls';
    password: string;
    'idle-session-check-interval'?: number;
    'idle-session-timeout'?: number;
    'min-idle-session'?: number;
  };
export type SubscriptionNode = (
  ShadowsocksNode | VmessNode | VlessNode | TrojanNode | HysteriaNode | Hysteria2Node | AnytlsNode
) &
  Record<string, Json>;
export type SubscriptionProtocol = SubscriptionNode['type'];
