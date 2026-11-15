import { CONFIG_TYPES } from '../../shared';
import type { BaseProxyGroup, ConfigDeclaration, ConfigParameter } from '../../types';
import type { CompiledNode, TemplateTarget } from '../types';

export function createGroupResolver(
  config: readonly ConfigDeclaration[],
  nodes: readonly CompiledNode[],
  target: TemplateTarget,
): (entry: BaseProxyGroup) => BaseProxyGroup {
  const names = nodes.flatMap((node) => {
    const name = target === 'singbox' ? node.value.tag : node.value.name;

    return typeof name === 'string' ? [name] : [];
  });
  const references = new Set([
    ...names,
    'DIRECT',
    'REJECT',
    'REJECT-DROP',
    'REJECT-NO-DROP',
    'REJECT-TINYGIF',
    'REJECT-DICT',
    'REJECT-ARRAY',
    'PASS',
    'COMPATIBLE',
    'GLOBAL',
    'direct',
    'reject',
    'proxy',
    ...config.flatMap((declaration) =>
      declaration.type === CONFIG_TYPES.PROXY_GROUP || (target === 'loon' && declaration.type === CONFIG_TYPES.CUSTOM)
        ? [declaration.value.name]
        : [],
    ),
  ]);
  const patterns = new Map<string, RegExp>();

  function expand(member: string): string[] {
    if (references.has(member)) {
      return [member];
    }

    let pattern = patterns.get(member);

    if (!pattern) {
      try {
        pattern = new RegExp(member);
      } catch {
        throw new Error(`Invalid proxy group member regex: ${member}`);
      }

      patterns.set(member, pattern);
    }

    return names.filter((name) => pattern.test(name));
  }

  return (entry) => {
    if (
      entry.parameters.some(
        (parameter) => parameter.type === 'named' && ['proxies', 'outbounds'].includes(parameter.name),
      )
    ) {
      throw new Error('Proxy group members must use positional parameters');
    }

    if (entry.kind === 'ssid' || entry.kind === 'subnet') {
      return entry;
    }

    const parameters = entry.parameters.flatMap((parameter): ConfigParameter[] => {
      if (parameter.type === 'positional') {
        return expand(parameter.value).map((value) => ({ type: 'positional', value }));
      }

      return [parameter];
    });

    return { ...entry, parameters };
  };
}
