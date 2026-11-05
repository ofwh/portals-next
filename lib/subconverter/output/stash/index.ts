import { transform as transformNodes } from './nodes';
import { adapter as clash } from '../clash';
import { combine } from '../clash/combine';
import { transform as transformPolicies } from '../clash/policies';
import { transform as transformRules } from '../clash/rules';

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
