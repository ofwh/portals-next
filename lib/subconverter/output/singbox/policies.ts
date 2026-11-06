import logger from '@/lib/api/logger';
import type { NodeProjection } from './nodes';
import type { ConvertedNodes, NativeObject, OutputContext, OutputElements } from '../../types/output';
import { fail, OUTPUT_ERROR } from '../shared/errors';
import { resolvePolicies } from '../shared/policies';

export function transform(
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<NodeProjection>,
  context: OutputContext,
) {
  const result = resolvePolicies(policies, nodes, context.symbols);
  const value: NativeObject[] = result.entries.map(({ definition, members }, index) => {
    if (!['select', 'url-test'].includes(definition.type) || definition.timeout || members.includes('REJECT')) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_SINGBOX_GROUP, { data: definition, field: 'fields' });

      return fail('policy', index, 'fields', OUTPUT_ERROR.UNSUPPORTED_SINGBOX_GROUP);
    }

    const group: NativeObject = {
      type: definition.type === 'select' ? 'selector' : 'urltest',
      tag: definition.name,
      outbounds: members,
    };

    if (definition.type === 'select' && (definition.url || definition.interval || definition.tolerance)) {
      logger.warn(OUTPUT_ERROR.SELECTOR_HEALTH_CHECK_NOT_SUPPORTED, { data: definition, field: 'fields' });

      return fail('policy', index, 'fields', OUTPUT_ERROR.SELECTOR_HEALTH_CHECK_NOT_SUPPORTED);
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
