import { members } from './shared';
import type { ProxyNode } from '../../../types/proxy-node';
import { warn } from '../../diagnostics';
import type { CompileContext, TargetObject } from '../../types';
import { duration } from '../shared';

export function singboxGroups(context: CompileContext, nodes: ProxyNode[]): TargetObject[] {
  const result: TargetObject[] = [];

  for (const [index, group] of context.groups.entries()) {
    if (!['select', 'url-test', 'fallback', 'load-balance'].includes(group.kind)) {
      warn(context, 'UNSUPPORTED_GROUP', 'groups', index);
      continue;
    }

    const selected = members(group, nodes);
    const value: TargetObject = {
      type: group.kind === 'select' ? 'selector' : 'urltest',
      tag: group.name,
      outbounds: selected.length ? selected : ['DIRECT'],
    };

    if (group.kind === 'url-test') {
      value.url = group.healthCheck?.url ?? '';
      value.interval = duration(group.healthCheck?.interval ?? 300);
      if ((group.healthCheck?.tolerance ?? 0) > 0) {
        value.tolerance = group.healthCheck!.tolerance!;
      }
    }

    result.push(value);
  }

  return result;
}
