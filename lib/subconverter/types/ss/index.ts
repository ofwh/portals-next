export interface SSProxyNode {
  server: string;
  serverPort: string | number;
  method: string;
  password: string;
  remarks?: string;
  group?: string;
  plugin?: string;
  pluginOpts?: string;
}

export interface SSConfigVariant2 {
  servers: Array<SSProxyNode>;
  remarks?: string;
}

export interface SSConfigVariant3 {
  configs: Array<SSProxyNode>;
  remarks?: string;
}

export type SSConfig = Array<SSProxyNode> | SSConfigVariant2 | SSConfigVariant3;

export type { SSNodeFields } from './fields';

export type SSNode = SSProxyNode;
