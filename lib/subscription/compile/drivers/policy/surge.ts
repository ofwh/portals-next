import { iniGroupLine, iniSsidLine, members } from './shared';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { writeSection } from '../shared';

export function surgeGroups(context: CompileContext, nodes: ProxyNode[], document: IniDocument): void {
  writeSection(document, 'Proxy Group', [], true);

  for (const [index, group] of context.groups.entries()) {
    if (!['select', 'smart', 'url-test', 'fallback', 'load-balance', 'ssid'].includes(group.kind)) {
      warn(context, 'UNSUPPORTED_GROUP', 'groups', index);
      continue;
    }

    const parameters = new Map<string, string>();

    if (group.kind === 'ssid') {
      writeSection(document, 'Proxy Group', [
        iniGroupLine(iniSsidLine(group, parameters), group, parameters, ',', index),
      ]);
      continue;
    }

    const selected = members(group, nodes);

    if (!selected.length && !group.policyPath) {
      selected.push('DIRECT');
    }

    if (
      !group.policyPath &&
      !Object.keys(group.flags ?? {}).length &&
      selected.length === 1 &&
      ['direct', 'reject', 'reject-tinygif'].includes(selected[0].toLowerCase())
    ) {
      writeSection(document, 'Proxy', [`${group.name} = ${selected[0].toLowerCase()}`]);
      continue;
    }

    if (['url-test', 'fallback', 'load-balance'].includes(group.kind)) {
      parameters.set('url', group.healthCheck?.url ?? '');
      parameters.set('interval', String(group.healthCheck?.interval ?? 300));
      if ((group.healthCheck?.tolerance ?? 0) > 0) {
        parameters.set('tolerance', String(group.healthCheck!.tolerance));
      }

      if ((group.healthCheck?.timeout ?? 5) > 0) {
        parameters.set('timeout', String(group.healthCheck?.timeout ?? 5));
      }

      if (group.persistent !== undefined) {
        parameters.set('persistent', String(group.persistent));
      }

      if (group.evaluateBeforeUse !== undefined) {
        parameters.set('evaluate-before-use', String(group.evaluateBeforeUse));
      }
    }

    if (group.policyPath) {
      const { url, pattern, interval } = group.policyPath;

      parameters.set('policy-path', url);
      parameters.set('policy-regex-filter', JSON.stringify(pattern ?? '.*'));
      if (interval !== undefined) {
        parameters.set('update-interval', String(interval));
      }
    }

    const line = `${group.name} = ${[group.kind, ...selected].join(',')}`;

    writeSection(document, 'Proxy Group', [iniGroupLine(line, group, parameters, ',', index)]);
  }
}
