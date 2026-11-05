import type { ConvertedNodes, OutputContext, OutputElements } from '../../types/output';
import { ini } from '../shared/ini';
import type { IniNodeProjection } from '../shared/ini';

export const transform = (
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
) =>
  ini.projectPolicies(policies, nodes, context, (definition, members, index) => {
    return ini.groupLine(definition, members, index, ['select', 'url-test', 'fallback', 'load-balance'], 'max-timeout');
  });
