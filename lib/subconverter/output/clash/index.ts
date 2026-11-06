import { stringify } from 'yaml';
import { transform as transformPolicies } from '@/lib/subconverter/policies/output/clash';
import { transform as transformRules } from '@/lib/subconverter/rulesets/output/clash';
import type { RuleProjection } from '@/lib/subconverter/rulesets/output/clash';
import { combine } from './combine';
import { transform as transformNodes } from './nodes';
import type { NativeObject, OutputAdapter } from '../../types/output';

export const adapter: OutputAdapter<NativeObject, RuleProjection, NativeObject[], NativeObject> = {
  target: 'clash',
  mediaType: 'text/yaml',
  nodes: { transform: transformNodes },
  policies: {
    transform: (policies, nodes, context) =>
      transformPolicies(policies, nodes, context, ['select', 'url-test', 'fallback', 'load-balance', 'relay', 'smart']),
  },
  rules: { transform: transformRules },
  combine,
  toString: (config) => stringify(config),
};
