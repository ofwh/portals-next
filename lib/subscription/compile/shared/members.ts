import type { BaseProxyGroup, ConfigParameter } from '../../types';

export function createGroupResolver(
  names: readonly string[],
  referenceNames: readonly string[],
  memberParameters: readonly string[] = [],
): (entry: BaseProxyGroup) => BaseProxyGroup {
  const references = new Set(referenceNames);
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
    if (entry.parameters.some((parameter) => parameter.type === 'named' && memberParameters.includes(parameter.name))) {
      throw new Error('Proxy group members must use positional parameters');
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
