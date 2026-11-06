import logger from '@/lib/api/logger';
import { fail, OUTPUT_ERROR } from '@/lib/subconverter/output/shared/errors';
import { token } from '@/lib/subconverter/output/shared/ini/token';
import type { IniNodeProjection } from '@/lib/subconverter/output/shared/ini/types';
import { resolvePolicies } from '@/lib/subconverter/policies/output/shared';
import type { ConvertedNodes, OutputContext } from '@/lib/subconverter/types/output';
import type { PolicyConfigFields, PolicyGroupType } from '@/lib/subconverter/types/policies';

export function projectPolicies(
  policies: readonly PolicyConfigFields[],
  nodes: ConvertedNodes<IniNodeProjection>,
  context: OutputContext,
  project: (definition: PolicyConfigFields, members: string[], index: number) => string,
  requireHealthCheckUrl = true,
) {
  const result = resolvePolicies(policies, nodes, context.symbols, requireHealthCheckUrl);

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
    logger.warn(OUTPUT_ERROR.UNSUPPORTED_GROUP_TYPE, { data: definition, field: 'type' });

    return fail('policy', index, 'type', OUTPUT_ERROR.UNSUPPORTED_GROUP_TYPE);
  }

  if (
    definition.type === 'select' &&
    (definition.url || definition.interval || definition.timeout || definition.tolerance)
  ) {
    logger.warn(OUTPUT_ERROR.UNSUPPORTED_GROUP_HEALTH_CHECK, { data: definition, field: 'fields' });

    return fail('policy', index, 'fields', OUTPUT_ERROR.UNSUPPORTED_GROUP_HEALTH_CHECK);
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
