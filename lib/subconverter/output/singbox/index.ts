import { transform as nodes } from './nodes';
import type { NodeProjection } from './nodes';
import { transform as policies } from './policies';
import { transform as rules } from './rules';
import type { RuleProjection } from './rules';
import type { NativeObject, OutputAdapter } from '../../types/output';

export const adapter: OutputAdapter<NodeProjection, RuleProjection, NativeObject[], NativeObject> = {
  target: 'singbox',
  mediaType: 'application/json',
  nodes: { transform: nodes },
  policies: { transform: policies },
  rules: { transform: rules },
  combine: (parts) => ({
    outbounds: [
      ...parts.nodes.entries.filter((entry) => entry.value.region === 'outbounds').map((entry) => entry.value.value),
      ...parts.policies.value,
      { type: 'direct', tag: 'DIRECT' },
    ],
    endpoints: parts.nodes.entries
      .filter((entry) => entry.value.region === 'endpoints')
      .map((entry) => entry.value.value),
    route: { rules: parts.rules.value.rules, ...(parts.rules.value.final ? { final: parts.rules.value.final } : {}) },
  }),
  toString: (config) => JSON.stringify(config, null, 2) + '\n',
};
