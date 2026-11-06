import { ini } from '@/lib/subconverter/output/shared/ini';
import type { IniNodeProjection } from '@/lib/subconverter/output/shared/ini';
import type { ConvertedNodes, OutputContext, OutputElements } from '@/lib/subconverter/types/output';

export const transform = (
  policies: OutputElements['policies'],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
) =>
  ini.projectPolicies(policies, nodes, context, (definition, members, index) => {
    return ini.groupLine(definition, members, index, ['select', 'url-test', 'fallback', 'load-balance'], 'max-timeout');
  });
