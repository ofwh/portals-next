import type { IniProxyNode } from '../ini';
import type { SSRProxyNode } from '../ssr';

export interface VMessShareNode {
  add: string;
  port: string | number;
  id: string;
  v?: string | number;
  ps?: string;
  aid?: string | number;
  scy?: string;
  net?: string;
  type?: string;
  host?: string;
  path?: string;
  tls?: string;
  sni?: string;
  alpn?: string;
  fp?: string;
}

export type UriScheme =
  | 'anytls'
  | 'http'
  | 'hysteria'
  | 'hysteria2'
  | 'mieru'
  | 'socks5'
  | 'ss'
  | 'ssr'
  | 'trojan'
  | 'tuic'
  | 'vless'
  | 'vmess'
  | 'wireguard'
  | 'socks'
  | 'vmess1'
  | 'vless1'
  | 'trojan-go'
  | 'socks5h'
  | 'https'
  | 'tg'
  | 'hy'
  | 'hy2'
  | 'hysteria2+realm'
  | 'hy2+realm'
  | 'hysteria2+realm+http'
  | 'naive+https'
  | 'naive+quic'
  | 'mierus';

export interface UriUrlProxyNode {
  scheme: UriScheme;
  raw?: string;
  name: string;
  server: string;
  port?: number;
  ports?: string;
  username: string;
  password: string;
  path: string;
  query: Array<[string, string]>;
}

export interface UriVMessProxyNode {
  scheme: 'vmess' | 'vmess1';
  raw?: string;
  config: IniProxyNode | VMessShareNode;
}

export interface UriShadowsocksRProxyNode {
  scheme: 'ssr';
  raw?: string;
  config: SSRProxyNode;
  query: Array<[string, string]>;
}

export type UriProxyNode = UriUrlProxyNode | UriVMessProxyNode | UriShadowsocksRProxyNode;

export interface UriConfig {
  nodes: Array<UriProxyNode>;
}

export type { UriNodeFields } from './fields';

export type UriNode = UriProxyNode;
