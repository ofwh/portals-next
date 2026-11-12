import { iniGroupLine, iniSsidLine, members } from './shared';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { entries, iniLine, writeSection } from '../shared';

export function loonGroups(context: CompileContext, nodes: ProxyNode[], document: IniDocument): void {
  const original = entries(document, 'Proxy Group').map(iniLine);

  writeSection(document, 'Proxy Group', [], true);

  for (const [index, group] of context.groups.entries()) {
    if (!['select', 'url-test', 'fallback', 'load-balance', 'ssid'].includes(group.kind)) {
      warn(context, 'UNSUPPORTED_GROUP', 'groups', index);
      continue;
    }

    const parameters = new Map<string, string>();

    if (group.kind === 'ssid') {
      if (group.selectors.length < 2) {
        continue;
      }

      writeSection(document, 'Proxy Group', [
        iniGroupLine(iniSsidLine(group, parameters), group, parameters, ',', index),
      ]);
      continue;
    }

    const selected = members(group, nodes);
    const base = original.find((line) => line.split('=')[0].trim() === group.name);
    const icon = base?.split(',').at(-1)?.trim();

    if (icon?.startsWith('img-url')) {
      parameters.set('img-url', icon.slice(icon.indexOf('=') + 1).trim());
    }

    if (group.kind !== 'select') {
      parameters.set('url', group.healthCheck?.url ?? '');
      parameters.set('interval', String(group.healthCheck?.interval ?? 300));
      if (group.kind === 'url-test' && (group.healthCheck?.tolerance ?? 0) > 0) {
        parameters.set('tolerance', String(group.healthCheck!.tolerance));
      }

      if (group.kind === 'fallback') {
        parameters.set('max-timeout', String(group.healthCheck?.timeout ?? 5));
      }

      if (group.kind === 'load-balance') {
        parameters.set('algorithm', group.strategy === 'round-robin' ? 'round-robin' : 'pcc');
        if ((group.healthCheck?.timeout ?? 5) > 0) {
          parameters.set('max-timeout', String(group.healthCheck?.timeout ?? 5));
        }
      }
    }

    const line = `${group.name} = ${group.kind},${selected.length ? selected.join(',') : 'DIRECT'}`;

    writeSection(document, 'Proxy Group', [iniGroupLine(line, group, parameters, ',', index)]);
  }
}
