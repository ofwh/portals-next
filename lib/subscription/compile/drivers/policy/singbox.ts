import { applyGroupFlags, members } from './shared';
import type { ProxyNode } from '../../../types/proxy-node';
import { CompileError } from '../../diagnostics';
import type { CompileContext, TargetObject } from '../../types';
import { duration } from '../shared';

export function singboxGroups(context: CompileContext, nodes: ProxyNode[]): TargetObject[] {
  const result: TargetObject[] = [];

  for (const [index, group] of context.groups.entries()) {
    if (group.kind === 'remote-filter') {
      continue;
    }

    if (group.kind !== 'select' && group.kind !== 'url-test') {
      throw new CompileError('UNSUPPORTED_GROUP', 'groups', index);
    }

    const selected = members(group, nodes);
    const value: TargetObject = {
      type: group.kind === 'select' ? 'selector' : 'urltest',
      tag: group.name,
      outbounds: selected,
    };

    if (group.kind === 'url-test') {
      if (group.healthCheck?.url !== undefined) {
        value.url = group.healthCheck.url;
      }

      if (group.healthCheck?.interval !== undefined) {
        value.interval = duration(group.healthCheck.interval) || '0s';
      }

      if (group.healthCheck?.tolerance !== undefined) {
        value.tolerance = group.healthCheck.tolerance;
      }
    }

    if (group.interruptExistConnections !== undefined) {
      value.interrupt_exist_connections = group.interruptExistConnections;
    }

    applyGroupFlags(value, group);
    result.push(value);
  }

  return result;
}
