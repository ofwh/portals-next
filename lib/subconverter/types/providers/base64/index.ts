import type { IniNode } from '../ini';
import type { IniConfig, IniProxyNode } from '../ini';
import type { UriNode } from '../uri';
import type { UriConfig, UriProxyNode } from '../uri';

export type Base64ProxyNode = UriProxyNode | IniProxyNode;
export type Base64Config = UriConfig | IniConfig;

export type { Base64NodeFields } from './fields';

export type Base64Node = UriNode | IniNode;
