import { members } from './shared';
import type { MemberSelector } from '../../../types/policy';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { entries, iniLine, writeSection } from '../shared';

function selectorText(selector: MemberSelector): string {
  return selector.kind === 'reference'
    ? `[]${selector.name}`
    : selector.kind === 'name'
      ? selector.pattern
      : selector.kind === 'script'
        ? `script:${selector.source}`
        : `!!${selector.kind.toUpperCase()}=${selector.target}`;
}

export function iniGroups(context: CompileContext, nodes: ProxyNode[], document: IniDocument): void {
  const target = context.target;
  const section = target === 'quanx' ? 'policy' : target === 'mellow' ? 'EndpointGroup' : 'Proxy Group';
  const original = entries(document, section).map(iniLine);

  if (target !== 'mellow') {
    writeSection(document, section, [], true);
  }

  for (const [index, group] of context.groups.entries()) {
    const supported =
      target === 'mellow'
        ? ['select', 'url-test', 'fallback', 'load-balance']
        : target === 'loon'
          ? ['select', 'url-test', 'fallback', 'load-balance', 'ssid']
          : ['select', 'smart', 'url-test', 'fallback', 'load-balance', 'ssid'];

    if (!supported.includes(group.kind)) {
      warn(context, 'UNSUPPORTED_GROUP', 'groups', index);
      continue;
    }

    if (group.kind === 'ssid') {
      const raw = group.selectors.map(selectorText);

      if (target === 'loon' && raw.length < 2) {
        continue;
      }

      writeSection(document, section, [
        target === 'quanx'
          ? `ssid=${group.name}, ${raw.map((member) => member.replaceAll('=', ':')).join(', ')}`
          : `${group.name} = ssid,default=${raw[0] ?? ''},${raw.slice(1).join(',')}`,
      ]);
      continue;
    }

    let selected = members(group, nodes, target !== 'mellow');

    if (!selected.length) {
      selected =
        target === 'mellow' && nodes.length
          ? nodes.map((node) => node.name)
          : [target === 'quanx' ? 'direct' : 'DIRECT'];
    }

    if (target === 'mellow') {
      writeSection(document, section, [`${group.name}, ${selected.join(':')}, latency, interval=300, timeout=6`]);
      continue;
    }

    if (
      (target === 'surge' || target === 'surfboard') &&
      selected.length === 1 &&
      ['direct', 'reject', 'reject-tinygif'].includes(selected[0].toLowerCase())
    ) {
      writeSection(document, 'Proxy', [`${group.name} = ${selected[0].toLowerCase()}`]);
      continue;
    }

    if (target === 'loon' || target === 'quanx') {
      const base = original.find(
        (line) =>
          (target === 'loon' ? line.split('=')[0] : line.slice(line.indexOf('=') + 1).split(',')[0]).trim() ===
          group.name,
      );
      const icon = base?.split(',').at(-1)?.trim();

      if (icon?.startsWith('img-url')) {
        selected.push(icon);
      }
    }

    const interval = group.healthCheck?.interval ?? 300;
    const tolerance = group.healthCheck?.tolerance ?? 0;
    const timeout = group.healthCheck?.timeout ?? 5;
    let type: string = group.kind;

    if (target === 'quanx') {
      type =
        group.kind === 'select'
          ? 'static'
          : group.kind === 'url-test'
            ? 'url-latency-benchmark'
            : group.kind === 'fallback'
              ? 'available'
              : 'round-robin';
      if (selected.filter((member) => !member.startsWith('img-url')).length < 2 && group.kind !== 'select') {
        type = 'static';
      }
    }

    let line =
      target === 'quanx'
        ? `${type}=${group.name}, ${selected.join(', ')}`
        : `${group.name} = ${type},${selected.join(',')}`;

    if (target === 'quanx' && group.kind !== 'select') {
      line += `, check-interval=${interval}${tolerance > 0 ? `, tolerance=${tolerance}` : ''}`;
    } else if (target === 'loon' && group.kind !== 'select') {
      line += `,url=${group.healthCheck?.url ?? ''},interval=${interval}`;
      if (group.kind === 'url-test' && tolerance > 0) {
        line += `,tolerance=${tolerance}`;
      }

      if (group.kind === 'fallback') {
        line += `,max-timeout=${timeout}`;
      }

      if (group.kind === 'load-balance') {
        line += `,algorithm=${group.strategy === 'round-robin' ? 'round-robin' : 'pcc'}${timeout > 0 ? `,max-timeout=${timeout}` : ''}`;
      }
    } else if (['url-test', 'fallback'].includes(group.kind) || (group.kind === 'load-balance' && target === 'surge')) {
      let url = group.healthCheck?.url ?? '';

      if (target === 'surfboard' && url && !/^http:\/\//i.test(url)) {
        url = 'http://www.gstatic.com/generate_204';
      }

      if (target !== 'surfboard' || url) {
        line += `,url=${url}`;
      }

      line += `,interval=${interval}`;
      if (tolerance > 0 && (target !== 'surfboard' || group.kind === 'url-test')) {
        line += `,tolerance=${tolerance}`;
      }

      if (timeout > 0) {
        line += `,timeout=${timeout}`;
      }

      if (target !== 'surfboard') {
        if (group.persistent !== undefined) {
          line += `,persistent=${group.persistent}`;
        }

        if (group.evaluateBeforeUse !== undefined) {
          line += `,evaluate-before-use=${group.evaluateBeforeUse}`;
        }
      }
    }

    writeSection(document, section, [line]);
  }
}
