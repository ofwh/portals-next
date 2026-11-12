import { iniGroupLine, members, selectorText } from './shared';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { entries, iniLine, writeSection } from '../shared';

const groupTypes = {
  select: 'static',
  smart: 'round-robin',
  'url-test': 'url-latency-benchmark',
  fallback: 'available',
  'load-balance': 'round-robin',
  ssid: 'ssid',
};

export function quanxGroups(context: CompileContext, nodes: ProxyNode[], document: IniDocument): void {
  const original = entries(document, 'policy').map(iniLine);

  writeSection(document, 'policy', [], true);

  for (const [index, group] of context.groups.entries()) {
    if (group.kind === 'remote-filter') {
      continue;
    }

    if (group.kind === 'relay') {
      warn(context, 'UNSUPPORTED_GROUP', 'groups', index);
      continue;
    }

    const parameters = new Map<string, string>();
    const base = original.find(
      (line) =>
        line
          .slice(line.indexOf('=') + 1)
          .split(',')[0]
          .trim() === group.name,
    );
    const icon = base?.split(',').at(-1)?.trim();

    if (icon?.startsWith('img-url')) {
      parameters.set('img-url', icon.slice(icon.indexOf('=') + 1).trim());
    }

    if (group.kind === 'ssid') {
      const raw = group.selectors.map(selectorText);
      const line = `ssid=${group.name}, ${raw.map((member) => member.replaceAll('=', ':')).join(', ')}`;

      writeSection(document, 'policy', [iniGroupLine(line, group, parameters, ', ', index)]);
      continue;
    }

    const patterns =
      group.kind === 'url-test'
        ? group.selectors.flatMap((selector) => (selector.kind === 'name' ? [selector.pattern] : []))
        : [];
    let selected = members(
      patterns.length ? { ...group, selectors: group.selectors.filter((selector) => selector.kind !== 'name') } : group,
      nodes,
    );

    if (patterns.length) {
      parameters.set(
        'server-tag-regex',
        patterns.length === 1 ? patterns[0] : patterns.map((value) => `(?:${value})`).join('|'),
      );
    }

    if (!selected.length && !patterns.length) {
      selected = ['direct'];
    }

    let type: string = groupTypes[group.kind];

    if (
      !patterns.length &&
      !Object.hasOwn(group.flags ?? {}, 'server-tag-regex') &&
      !Object.hasOwn(group.flags ?? {}, 'resource-tag-regex') &&
      selected.filter((member) => !member.startsWith('img-url')).length < 2 &&
      group.kind !== 'select'
    ) {
      type = 'static';
    }

    if (group.kind !== 'select') {
      parameters.set('check-interval', String(group.healthCheck?.interval ?? 300));
      if ((group.healthCheck?.tolerance ?? 0) > 0) {
        parameters.set('tolerance', String(group.healthCheck!.tolerance));
      }
    }

    const line = `${type}=${group.name}${selected.length ? `, ${selected.join(', ')}` : ''}`;

    writeSection(document, 'policy', [iniGroupLine(line, group, parameters, ', ', index)]);
  }
}
