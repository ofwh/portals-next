import { iniGroupLine, iniSsidLine, members } from './shared';
import { unquote } from '../../../shared/text';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { CompileError, warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { loonValue } from '../loon';
import { entries, iniLine, writeSection } from '../shared';

export function loonGroups(context: CompileContext, nodes: ProxyNode[], document: IniDocument): void {
  const original = entries(document, 'Proxy Group').map(iniLine);
  const filters = new Map<string, string>();

  for (const [index, group] of context.groups.entries()) {
    if (group.kind !== 'remote-filter') {
      continue;
    }

    if (!group.remoteFilter || filters.has(group.name)) {
      throw new CompileError('INVALID_INPUT', 'groups.remoteFilter', index);
    }

    const { mode, filterKey } = group.remoteFilter;

    filters.set(group.name, `${loonValue(group.name)} = ${mode}, FilterKey = ${loonValue(filterKey, true)}`);
  }

  writeSection(document, 'Remote Filter', [...filters.values()], true);
  writeSection(document, 'Proxy Group', [], true);

  for (const [index, group] of context.groups.entries()) {
    if (group.kind === 'remote-filter') {
      continue;
    }

    if (!['select', 'url-test', 'fallback', 'load-balance', 'ssid'].includes(group.kind)) {
      warn(context, 'UNSUPPORTED_GROUP', 'groups', index);
      continue;
    }

    const parameters = new Map<string, string>();
    const base = original.find((line) => line.split('=')[0].trim() === group.name);
    const icon = base?.split(',').at(-1)?.trim();

    if (icon?.startsWith('img-url')) {
      parameters.set('img-url', icon.slice(icon.indexOf('=') + 1).trim());
    }

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

    if (group.kind === 'select' && group.healthCheck?.url) {
      parameters.set('url', group.healthCheck.url);
    }

    if (group.kind !== 'select') {
      parameters.set('url', group.healthCheck?.url ?? '');
      parameters.set('interval', String(group.healthCheck?.interval ?? 300));
      if (group.kind === 'url-test' && (group.healthCheck?.tolerance ?? 0) > 0) {
        parameters.set('tolerance', String(group.healthCheck!.tolerance));
      }

      if (group.kind === 'fallback' || group.kind === 'load-balance') {
        const timeout = group.healthCheck?.timeout;

        if (timeout !== undefined && timeout > 0) {
          parameters.set('max-timeout', String(timeout));
        }
      }

      if (group.kind === 'load-balance') {
        parameters.set('algorithm', group.strategy === 'round-robin' ? 'round-robin' : 'pcc');
      }
    }

    const line = `${loonValue(group.name)} = ${group.kind},${selected.length ? selected.map((name) => loonValue(unquote(name))).join(',') : 'DIRECT'}`;

    writeSection(document, 'Proxy Group', [iniGroupLine(line, group, parameters, ',', index)]);
  }
}
