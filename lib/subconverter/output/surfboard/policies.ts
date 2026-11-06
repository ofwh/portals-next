import logger from '@/lib/api/logger';
import type { ConvertedNodes, OutputContext, OutputElements } from '../../types/output';
import { fail, OUTPUT_ERROR } from '../shared/errors';
import { ini } from '../shared/ini';
import type { IniNodeProjection } from '../shared/ini';

export const transform = (
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
) =>
  ini.projectPolicies(policies, nodes, context, (definition, members, index) => {
    if (definition.url && !definition.url.startsWith('http://')) {
      logger.warn(OUTPUT_ERROR.SURFBOARD_REQUIRES_HTTP_TEST_URL, { data: definition, field: 'url' });

      return fail('policy', index, 'url', OUTPUT_ERROR.SURFBOARD_REQUIRES_HTTP_TEST_URL);
    }

    return ini.groupLine(definition, members, index, ['select', 'url-test', 'fallback', 'load-balance']);
  });
