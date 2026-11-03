export interface SSRProxyNode {
  server: string;
  serverPort: string | number;
  method: string;
  password: string;
  protocol?: string;
  protocolparam?: string;
  protocolParam?: string;
  obfs?: string;
  obfsparam?: string;
  obfsParam?: string;
  remarks?: string;
  group?: string;
  plugin?: string;
  pluginOpts?: string;
}

export interface SSRConfigVariant1 {
  localAddress: string;
  localPort: string | number;
  server: string;
  serverPort: string | number;
  method: string;
  password: string;
  protocol?: string;
  protocolparam?: string;
  protocolParam?: string;
  obfs?: string;
  obfsparam?: string;
  obfsParam?: string;
  remarks?: string;
  group?: string;
  plugin?: string;
  pluginOpts?: string;
}

export interface SSRConfigVariant2 {
  configs: Array<SSRProxyNode>;
}

export type SSRConfig = SSRConfigVariant1 | SSRConfigVariant2;

export type { SSRNodeFields } from './fields';

export type SSRNode = SSRProxyNode;
