import { transform as policies } from '@/lib/subconverter/policies/output/singbox';
import { transform as rules } from '@/lib/subconverter/rulesets/output/singbox';
import type { RuleProjection } from '@/lib/subconverter/rulesets/output/singbox';
import { combine } from './combine';
import { transform as nodes } from './nodes';
import type { NodeProjection } from './nodes';
import type { NativeObject, OutputAdapter } from '../../types/output';

export const adapter: OutputAdapter<NodeProjection, RuleProjection, NativeObject[], NativeObject> = {
  target: 'singbox',
  mediaType: 'application/json',
  nodes: { transform: nodes },
  policies: { transform: policies },
  rules: { transform: rules },
  combine,
  toString: (config) => JSON.stringify(config, null, 2) + '\n',
};
