import type { PolicyGroupType } from '@/lib/workflow/nodes/configuration/nodes/policies/model/fields-types';
import type { PolicyConfigFields } from '@/lib/workflow/nodes/configuration/nodes/policies/model/types';
import { fail } from '../shared/errors';
import { resolvePolicies } from '../shared/policies';
import type { ConvertedNodes, NativeObject, OutputContext } from '../types';

export function transform(
  policies: readonly PolicyConfigFields[],
  nodes: ConvertedNodes<NativeObject>,
  context: OutputContext,
  allowed: readonly PolicyGroupType[],
  stash = false,
) {
  const result = resolvePolicies(policies, nodes, context.symbols);
  const value: NativeObject[] = result.entries.map(({ definition, members }, index) => {
    if (!allowed.includes(definition.type)) {
      return fail('policy', index, 'type', 'unsupported-group-type');
    }

    if (
      stash &&
      ((definition.type !== 'relay' && (definition.url || definition.timeout || definition.tolerance)) ||
        (definition.type === 'relay' && definition.tolerance))
    ) {
      return fail('policy', index, 'fields', 'unsupported-stash-group-benchmark');
    }

    const group: NativeObject = { name: definition.name, type: definition.type, proxies: members };

    if (definition.url !== undefined) {
      group[stash && definition.type === 'relay' ? 'benchmark-url' : 'url'] = definition.url;
    }

    if (definition.interval !== undefined) {
      group.interval = definition.interval;
    }

    if (definition.timeout !== undefined && definition.timeout !== 0) {
      group[stash ? 'benchmark-timeout' : 'timeout'] = definition.timeout;
    }

    if (!stash && definition.tolerance !== undefined) {
      group.tolerance = definition.tolerance;
    }

    return group;
  });

  return { value, symbols: result.symbols, issues: [] };
}
