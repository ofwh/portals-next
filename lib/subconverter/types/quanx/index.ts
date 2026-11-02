import type { IniProxyNode, IniSection } from '../ini';

export type QuanXProxyNode = IniProxyNode;

export interface QuanXConfig {
  sections: Array<IniSection>;
  proxies: Array<IniProxyNode>;
}

export type { QuanXNodeFields } from './fields';

export type { IniNode as QuanXNode } from '../ini';
