import { transform as nodes } from './nodes';
import { transform as policies } from './policies';
import { transform as rules } from './rules';
import { combineIni, stringifyIni } from '../shared/ini';
import type { IniDocument, IniNodeProjection, IniRuleProjection } from '../shared/ini';
import type { OutputAdapter } from '../types';

export const adapter: OutputAdapter<IniNodeProjection, IniRuleProjection, string[], IniDocument> = {
  target: 'surge',
  mediaType: 'text/plain',
  nodes: { transform: nodes },
  policies: { transform: policies },
  rules: { transform: rules },
  combine: (parts) => combineIni(parts, { nodes: 'Proxy', policies: 'Proxy Group', rules: 'Rule' }),
  toString: stringifyIni,
};
