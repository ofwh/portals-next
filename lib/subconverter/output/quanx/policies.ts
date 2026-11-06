import logger from '@/lib/api/logger';
import type { ConvertedNodes, OutputContext, OutputElements } from '../../types/output';
import { fail, OUTPUT_ERROR } from '../shared/errors';
import { ini } from '../shared/ini';
import type { IniNodeProjection } from '../shared/ini';

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
  ini.projectPolicies(policies, nodes, context, (definition, members, index) => {
    if (!(definition.type in behaviors) || definition.url || definition.timeout || definition.tolerance) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_QUANX_GROUP_OPTION, { data: definition, field: 'fields' });

      return fail('policy', index, 'fields', OUTPUT_ERROR.UNSUPPORTED_QUANX_GROUP_OPTION);
    }

    const behavior = behaviors[definition.type as keyof typeof behaviors];
    const options = definition.interval !== undefined ? [`check-interval=${definition.interval}`] : [];

    return `${behavior} = ${[ini.token(definition.name), ...members.map(ini.token), ...options].join(', ')}`;
  });
