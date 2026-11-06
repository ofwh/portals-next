import logger from '@/lib/api/logger';
import { fail, OUTPUT_ERROR } from '@/lib/subconverter/output/shared/errors';
import { resolvePolicies } from '@/lib/subconverter/policies/output/shared';
import type { ConvertedNodes, NativeObject, OutputContext } from '@/lib/subconverter/types/output';
import type { PolicyGroupType } from '@/lib/subconverter/types/policies';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';

export function transform(
  policies: readonly PolicyConfigFields[],
  nodes: ConvertedNodes<NativeObject>,
  context: OutputContext,
  allowed: readonly PolicyGroupType[],
  stash = false,
) {
  const result = resolvePolicies(policies, nodes, context.symbols, !stash);
  const value: NativeObject[] = result.entries.map(({ definition, members }, index) => {
    if (!allowed.includes(definition.type)) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_GROUP_TYPE, { data: definition, field: 'type' });

      return fail('policy', index, 'type', OUTPUT_ERROR.UNSUPPORTED_GROUP_TYPE);
    }

    if (
      stash &&
      ((definition.type !== 'relay' && (definition.url || definition.timeout || definition.tolerance)) ||
        (definition.type === 'relay' && definition.tolerance))
    ) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_STASH_GROUP_BENCHMARK, { data: definition, field: 'fields' });

      return fail('policy', index, 'fields', OUTPUT_ERROR.UNSUPPORTED_STASH_GROUP_BENCHMARK);
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
