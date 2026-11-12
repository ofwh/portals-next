import { iniGroupLine, iniSsidLine, members } from './shared';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { writeSection } from '../shared';

export function surfboardGroups(context: CompileContext, nodes: ProxyNode[], document: IniDocument): void {
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

    if (!selected.length) {
      selected.push('DIRECT');
    }

    if (
      !Object.keys(group.flags ?? {}).length &&
      selected.length === 1 &&
      ['direct', 'reject', 'reject-tinygif'].includes(selected[0].toLowerCase())
    ) {
      writeSection(document, 'Proxy', [`${group.name} = ${selected[0].toLowerCase()}`]);
      continue;
    }

    if (['url-test', 'fallback'].includes(group.kind)) {
      let url = group.healthCheck?.url ?? '';

      if (url && !/^http:\/\//i.test(url)) {
        url = 'http://www.gstatic.com/generate_204';
      }

      if (url) {
        parameters.set('url', url);
      }

      parameters.set('interval', String(group.healthCheck?.interval ?? 300));
      if (group.kind === 'url-test' && (group.healthCheck?.tolerance ?? 0) > 0) {
        parameters.set('tolerance', String(group.healthCheck!.tolerance));
      }

      if ((group.healthCheck?.timeout ?? 5) > 0) {
        parameters.set('timeout', String(group.healthCheck?.timeout ?? 5));
      }
    }

    const line = `${group.name} = ${group.kind},${selected.join(',')}`;

    writeSection(document, 'Proxy Group', [iniGroupLine(line, group, parameters, ',', index)]);
  }
}
