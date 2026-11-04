import type { ConvertedNodes, OutputContext, OutputElements } from '../../types/output';
import { fail } from '../shared/errors';
import type { IniNodeProjection } from '../shared/ini';
import { token } from '../shared/ini';
import { projectPolicies } from '../shared/ini-policies';

const behaviors = {
  select: 'static',
  'url-test': 'url-latency-benchmark',
  fallback: 'available',
  'load-balance': 'round-robin',
};

export const transform = (
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
) =>
  projectPolicies(policies, nodes, context, (definition, members, index) => {
    if (!(definition.type in behaviors) || definition.url || definition.timeout || definition.tolerance) {
      return fail('policy', index, 'fields', 'unsupported-quanx-group-option');
    }

    const behavior = behaviors[definition.type as keyof typeof behaviors];
    const options = definition.interval !== undefined ? [`check-interval=${definition.interval}`] : [];

    return `${behavior} = ${[token(definition.name), ...members.map(token), ...options].join(', ')}`;
  });
