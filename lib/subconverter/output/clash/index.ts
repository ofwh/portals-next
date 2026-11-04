import { stringify } from 'yaml';
import { transform as transformNodes } from './nodes';
import { transform as transformPolicies } from './policies';
import { transform as transformRules } from './rules';
import type { RuleProjection } from './rules';
import type { NativeObject, OutputAdapter } from '../types';

export const adapter: OutputAdapter<NativeObject, RuleProjection, NativeObject[], NativeObject> = {
  target: 'clash',
  mediaType: 'text/yaml',
  nodes: { transform: transformNodes },
  policies: {
    transform: (policies, nodes, context) =>
      transformPolicies(policies, nodes, context, ['select', 'url-test', 'fallback', 'load-balance', 'relay', 'smart']),
  },
  rules: { transform: transformRules },
  combine: ({ nodes, policies, rules }) => ({
    proxies: nodes.entries.map((entry) => entry.value),
    'proxy-groups': policies.value,
    rules: rules.value.rules,
    ...(Object.keys(rules.value.providers).length ? { 'rule-providers': rules.value.providers } : {}),
  }),
  toString: (config) => stringify(config),
};
