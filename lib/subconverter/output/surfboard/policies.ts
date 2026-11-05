import type { ConvertedNodes, OutputContext, OutputElements } from '../../types/output';
import { fail } from '../shared/errors';
import { ini } from '../shared/ini';
import type { IniNodeProjection } from '../shared/ini';

export const transform = (
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
) =>
  ini.projectPolicies(policies, nodes, context, (definition, members, index) => {
    if (definition.url && !definition.url.startsWith('http://')) {
      return fail('policy', index, 'url', 'surfboard-requires-http-test-url');
    }

    return ini.groupLine(definition, members, index, ['select', 'url-test', 'fallback', 'load-balance']);
  });
