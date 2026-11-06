import { ConfigurationFieldError } from '@/lib/subconverter/configuration/errors';
import { timedPolicyGroupTypes } from '@/lib/subconverter/policies/options';
import { readPolicyNodes } from '@/lib/subconverter/policies/shared/dataset';
import { transform } from '@/lib/subconverter/policies/shared/transform';
import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { PolicyConfigFields, PolicyGroupType } from '@/lib/subconverter/types/policies';

export type HealthCheckField = 'url' | 'interval' | 'timeout' | 'tolerance';

export function isTimed(group: PolicyConfigFields): boolean {
  return timedPolicyGroupTypes.includes(group.type);
}

export function parsePolicies(configuration: ConfigObject): PolicyConfigFields[] {
  const { nodes } = readPolicyNodes(configuration);
  const definitions = nodes.map((node) => {
    if (typeof node === 'string' || !timedPolicyGroupTypes.some((type) => type === node.type)) {
      return node;
    }

    return { ...node, interval: node.interval ?? '300' };
  });

  return transform(definitions);
}

export function validatePolicy(
  group: PolicyConfigFields,
  types: readonly PolicyGroupType[],
  fields: readonly HealthCheckField[],
): void {
  if (!types.includes(group.type)) {
    throw new ConfigurationFieldError('type', 'Unsupported policy type for the selected client');
  }

  for (const key of ['url', 'interval', 'timeout', 'tolerance'] as const) {
    if (!fields.includes(key) && group[key] !== undefined) {
      throw new ConfigurationFieldError(key, 'Unsupported policy field for the selected client');
    }
  }
}

export function withHealthCheckUrl(group: PolicyConfigFields): PolicyConfigFields {
  return isTimed(group) ? { ...group, url: group.url ?? 'https://www.gstatic.com/generate_204' } : group;
}
