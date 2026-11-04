import { transform as nodes } from './nodes';
import { transform as policies } from './policies';
import { transform as rules } from './rules';
import type { OutputAdapter } from '../../types/output';
import { combineIni, stringifyIni } from '../shared/ini';
import type { IniDocument, IniNodeProjection, IniRuleProjection } from '../shared/ini';

export const adapter: OutputAdapter<IniNodeProjection, IniRuleProjection, string[], IniDocument> = {
  target: 'quanx',
  mediaType: 'text/plain',
  nodes: { transform: nodes },
  policies: { transform: policies },
  rules: { transform: rules },
  combine: (parts) =>
    combineIni(parts, { nodes: 'server_local', policies: 'policy', rules: 'filter_local', remote: 'filter_remote' }),
  toString: stringifyIni,
};
