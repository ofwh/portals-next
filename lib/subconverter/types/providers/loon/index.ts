import type { IniProxyNode, IniSection } from '../ini';

export type LoonProxyNode = IniProxyNode;

export interface LoonConfig {
  sections: Array<IniSection>;
  proxies: Array<IniProxyNode>;
}

export type { LoonNodeFields } from './fields';

export type { IniNode as LoonNode } from '../ini';
