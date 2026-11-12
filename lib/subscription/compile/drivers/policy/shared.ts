import type { MemberSelector, ProxyGroup } from '../../../types/policy';
import type { ProxyNode } from '../../../types/proxy-node';
import { CompileError } from '../../diagnostics';
import type { TargetObject } from '../../types';

export function applyGroupFlags(output: TargetObject, group: ProxyGroup): void {
  if (group.flags !== undefined) {
    Object.defineProperties(output, Object.getOwnPropertyDescriptors(group.flags));
  }
}

function rangeMatch(expression: string, value: number): boolean {
  let matched = false;

  for (const item of expression.split(',')) {
    if (/^-?\d+$/.test(item)) {
      matched ||= Number(item) === value;
    } else if (/^!?\d+-\d+$/.test(item)) {
      const [first, last] = item.replace('!', '').split('-').map(Number);
      const inside = value >= first && value <= last;

      matched = item.startsWith('!') ? !inside : matched || inside;
    } else if (/^!-?\d+$/.test(item)) {
      matched = Number(item.slice(1)) !== value;
    } else if (/^\d+-$/.test(item)) {
      matched ||= value <= Number(item.slice(0, -1));
    } else if (/^\d+\+$/.test(item)) {
      matched ||= value >= Number(item.slice(0, -1));
    }
  }

  return matched;
}

function regex(pattern: string, full = false): RegExp {
  try {
    return new RegExp(full ? `^(?:${pattern})$` : pattern);
  } catch {
    throw new CompileError('INVALID_SELECTOR', 'groups.selectors');
  }
}

function matcher(
  selector: Exclude<MemberSelector, { kind: 'reference' } | { kind: 'script' }>,
): (node: ProxyNode) => boolean {
  const name = regex(selector.kind === 'name' ? selector.pattern : (selector.pattern ?? ''));

  if (selector.kind === 'name') {
    return (node) => name.test(node.name);
  }

  const target = selector.target;
  const pattern = ['group', 'type', 'server'].includes(selector.kind)
    ? regex(target, selector.kind === 'type')
    : undefined;

  return (node) => {
    const matches =
      selector.kind === 'group'
        ? pattern!.test(node.sourceGroup ?? '')
        : selector.kind === 'type'
          ? pattern!.test(node.protocol.toUpperCase())
          : selector.kind === 'server'
            ? pattern!.test(node.server)
            : rangeMatch(
                target,
                selector.kind === 'port'
                  ? node.port
                  : Number(node.sourceGroupId ?? 0) * (selector.kind === 'insert' ? -1 : 1),
              );

    return matches && name.test(node.name);
  };
}

export function members(group: ProxyGroup, nodes: ProxyNode[], direct = true): string[] {
  const result: string[] = [];

  for (const selector of group.selectors) {
    if (selector.kind === 'script') {
      continue;
    }

    if (selector.kind === 'reference' && direct) {
      result.push(selector.name);
      continue;
    }

    const matches =
      selector.kind === 'reference'
        ? (node: ProxyNode) => regex(`[]${selector.name}`).test(node.name)
        : matcher(selector);

    for (const node of nodes) {
      if (matches(node) && !result.includes(node.name)) {
        result.push(node.name);
      }
    }
  }

  return result;
}

export function selectorText(selector: MemberSelector): string {
  return selector.kind === 'reference'
    ? `[]${selector.name}`
    : selector.kind === 'name'
      ? selector.pattern
      : selector.kind === 'script'
        ? `script:${selector.source}`
        : `!!${selector.kind.toUpperCase()}=${selector.target}`;
}

export function iniGroupLine(
  line: string,
  group: ProxyGroup,
  parameters: Map<string, string>,
  separator: string,
  index: number,
): string {
  for (const [key, value] of Object.entries(group.flags ?? {})) {
    if (
      !/^[A-Za-z][\w-]*$/.test(key) ||
      !['string', 'number', 'boolean'].includes(typeof value) ||
      (typeof value === 'string' && /[\r\n]/.test(value))
    ) {
      throw new CompileError('INVALID_INPUT', `groups.flags.${key}`, index);
    }

    const text = String(value);
    const encoded = typeof value === 'string' && /[,"\s]/.test(text) ? JSON.stringify(text) : text;

    parameters.set(key, encoded);
  }

  return line + [...parameters].map(([key, value]) => `${separator}${key}=${value}`).join('');
}

export function iniSsidLine(group: ProxyGroup, parameters: Map<string, string>): string {
  const raw = group.selectors.map(selectorText);
  const members: string[] = [];

  parameters.set('default', raw[0] ?? '');

  for (const member of raw.slice(1)) {
    const offset = member.indexOf('=');

    if (offset < 0) {
      members.push(member);
    } else {
      parameters.set(member.slice(0, offset), member.slice(offset + 1));
    }
  }

  return `${group.name} = ssid${members.length ? `,${members.join(',')}` : ''}`;
}
