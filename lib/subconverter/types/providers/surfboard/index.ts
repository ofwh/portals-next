import type { IniProxyNode, IniSection } from '../ini';

export type SurfboardProxyNode = IniProxyNode;

export interface SurfboardConfig {
  sections: Array<IniSection>;
  proxies: Array<IniProxyNode>;
}

export type { SurfboardNodeFields } from './fields';

export type { IniNode as SurfboardNode } from '../ini';
