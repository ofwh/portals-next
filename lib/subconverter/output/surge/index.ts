import { transform as policies } from '@/lib/subconverter/policies/output/surge';
import { transform as rules } from '@/lib/subconverter/rulesets/output/surge';
import { transform as nodes } from './nodes';
import type { OutputAdapter } from '../../types/output';
import { ini } from '../shared/ini';
import type { IniDocument, IniNodeProjection, IniRuleProjection } from '../shared/ini';

export const adapter: OutputAdapter<IniNodeProjection, IniRuleProjection, string[], IniDocument> = {
  target: 'surge',
  mediaType: 'text/plain',
  nodes: { transform: nodes },
  policies: { transform: policies },
  rules: { transform: rules },
  combine: (parts, context) => ini.combine(parts, { nodes: 'Proxy', policies: 'Proxy Group', rules: 'Rule' }, context),
  toString: ini.stringify,
};
