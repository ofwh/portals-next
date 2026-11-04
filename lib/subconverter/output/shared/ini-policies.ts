import type { PolicyGroupType } from '@/lib/subconverter/types/policies';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';
import { fail } from './errors';
import { token } from './ini';
import type { IniNodeProjection } from './ini';
import { resolvePolicies } from './policies';
import type { ConvertedNodes, OutputContext } from '../../types/output';

export function projectPolicies(
  policies: readonly PolicyConfigFields[],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
  project: (definition: PolicyConfigFields, members: string[], index: number) => string,
) {
  const result = resolvePolicies(policies, nodes, context.symbols);

  return {
    value: result.entries.map(({ definition, members }, index) => project(definition, members, index)),
    symbols: result.symbols,
    issues: [],
  };
}

export function groupLine(
  definition: PolicyConfigFields,
  members: string[],
  index: number,
  allowed: readonly PolicyGroupType[],
  timeoutKey = 'timeout',
): string {
  if (!allowed.includes(definition.type)) {
    return fail('policy', index, 'type', 'unsupported-group-type');
  }

  if (
    (definition.type === 'select' || definition.type === 'smart') &&
    (definition.url || definition.interval || definition.timeout || definition.tolerance)
  ) {
    return fail('policy', index, 'fields', 'unsupported-group-health-check');
  }

  const options: string[] = [];

  if (definition.url) {
    options.push(`url=${token(definition.url)}`);
  }

  if (definition.interval !== undefined) {
    options.push(`interval=${definition.interval}`);
  }

  if (definition.timeout) {
    options.push(`${timeoutKey}=${definition.timeout}`);
  }

  if (definition.tolerance) {
    options.push(`tolerance=${definition.tolerance}`);
  }

  return `${token(definition.name)} = ${[definition.type, ...members.map(token), ...options].join(', ')}`;
}
