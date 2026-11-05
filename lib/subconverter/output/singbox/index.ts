import { combine } from './combine';
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
  combine,
  toString: (config) => JSON.stringify(config, null, 2) + '\n',
};
