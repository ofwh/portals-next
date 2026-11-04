import type { NodeProjection } from './nodes';
import type { ConvertedNodes, NativeObject, OutputContext, OutputElements } from '../../types/output';
import { fail } from '../shared/errors';
import { resolvePolicies } from '../shared/policies';

export function transform(
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<NodeProjection>,
  context: OutputContext,
) {
  const result = resolvePolicies(policies, nodes, context.symbols);
  const value: NativeObject[] = result.entries.map(({ definition, members }, index) => {
    if (!['select', 'url-test'].includes(definition.type) || definition.timeout || members.includes('REJECT')) {
      return fail('policy', index, 'fields', 'unsupported-singbox-group');
    }

    const group: NativeObject = {
      type: definition.type === 'select' ? 'selector' : 'urltest',
      tag: definition.name,
      outbounds: members,
    };

    if (definition.type === 'select' && (definition.url || definition.interval || definition.tolerance)) {
      return fail('policy', index, 'fields', 'selector-health-check-not-supported');
    }

    if (definition.url) {
      group.url = definition.url;
    }

    if (definition.interval !== undefined) {
      group.interval = `${definition.interval}s`;
    }

    if (definition.tolerance !== undefined) {
      group.tolerance = definition.tolerance;
    }

    return group;
  });

  return { value, symbols: result.symbols, issues: [] };
}
