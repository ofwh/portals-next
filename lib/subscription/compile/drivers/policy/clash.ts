import { inheritClashHealth } from './clash-health';
import { applyGroupFlags, members } from './shared';
import type { ProxyNode } from '../../../types/proxy-node';
import type { TemplateValue } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext, TargetObject } from '../../types';
import { put } from '../shared';

export function clashGroups(
  context: CompileContext,
  nodes: ProxyNode[],
  original: TemplateValue | undefined,
): TemplateValue[] {
  const result: TargetObject[] = [];
  const used = new Set<string>();

  for (const [index, group] of context.groups.entries()) {
    if (group.kind === 'remote-filter') {
      continue;
    }

    if (!['select', 'relay', 'load-balance', 'smart', 'url-test', 'fallback'].includes(group.kind)) {
      warn(context, 'UNSUPPORTED_GROUP', 'groups', index);
      continue;
    }

    const type = group.kind === 'smart' ? 'url-test' : group.kind;
    const selected = members(group, nodes);
    const output: TargetObject = { name: group.name, type, proxies: selected.length ? selected : ['DIRECT'] };

    if (['url-test', 'fallback', 'load-balance', 'smart'].includes(group.kind)) {
      output.url = group.healthCheck?.url ?? '';
      if ((group.healthCheck?.interval ?? 0) > 0) {
        output.interval = group.healthCheck!.interval!;
      }

      if ((group.healthCheck?.tolerance ?? 0) > 0) {
        output.tolerance = group.healthCheck!.tolerance!;
      }

      if (group.kind !== 'fallback') {
        put(output, 'lazy', group.lazy);
      }

      if (group.kind === 'load-balance') {
        output.strategy = group.strategy ?? 'consistent-hashing';
      }
    }

    if (group.kind === 'select' && group.healthCheck?.url) {
      output.url = group.healthCheck.url;
    }

    put(output, 'disable-udp', group.disableUdp);
    inheritClashHealth(output, original);
    applyGroupFlags(output, group);

    if (!used.has(group.name)) {
      result.push(output);
      used.add(group.name);
    }
  }

  return result;
}
