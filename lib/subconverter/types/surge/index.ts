import type { IniProxyNode, IniSection } from '../ini';

export type SurgeProxyNode = IniProxyNode;

export interface SurgeConfig {
  sections: Array<IniSection>;
  proxies: Array<IniProxyNode>;
}

export type { SurgeNodeFields } from './fields';

export type { IniNode as SurgeNode } from '../ini';
