import type { IniNodeProjection } from '../shared/ini';
import { groupLine, projectPolicies } from '../shared/ini-policies';
import type { ConvertedNodes, OutputContext, OutputElements } from '../types';

export const transform = (
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
) =>
  projectPolicies(policies, nodes, context, (definition, members, index) => {
    return groupLine(definition, members, index, ['select', 'url-test', 'fallback', 'load-balance'], 'max-timeout');
  });
