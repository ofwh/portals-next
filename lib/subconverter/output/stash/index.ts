import { transform as transformPolicies } from '@/lib/subconverter/policies/output/clash';
import { transform as transformRules } from '@/lib/subconverter/rulesets/output/clash';
import { transform as transformNodes } from './nodes';
import { adapter as clash } from '../clash';
import { combine } from '../clash/combine';

export const adapter: typeof clash = {
  ...clash,
  target: 'stash',
  combine: (parts, context) => combine(parts, context, true),
  nodes: { transform: transformNodes },
  policies: {
    transform: (policies, nodes, context) =>
      transformPolicies(policies, nodes, context, ['select', 'url-test', 'fallback', 'load-balance', 'relay'], true),
  },
  rules: { transform: (rules, context) => transformRules(rules, context, 'stash') },
};
