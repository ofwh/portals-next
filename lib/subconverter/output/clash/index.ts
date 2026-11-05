import { stringify } from 'yaml';
import { combine } from './combine';
import { transform as transformNodes } from './nodes';
import { transform as transformPolicies } from './policies';
import { transform as transformRules } from './rules';
import type { RuleProjection } from './rules';
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
