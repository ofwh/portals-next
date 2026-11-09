import type { MemberSelector, ProxyGroup } from '../../../types/policy';
import type { ProxyNode } from '../../../types/proxy-node';
import { CompileError } from '../../diagnostics';

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
