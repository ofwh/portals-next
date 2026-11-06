import logger from '@/lib/api/logger';
import { ConfigurationFieldError, integer } from '@/lib/subconverter/configuration/fields';
import { readPolicyGroupFields } from '@/lib/subconverter/policies/fields';
import { policyGroupTypes, timedPolicyGroupTypes } from '@/lib/subconverter/policies/options';
import { splitFields } from '@/lib/subconverter/providers/ini/utils';
import type { PolicyConfigFields, PolicyGroupFields } from '@/lib/subconverter/types/policies';
import type { PolicyConfigNode } from '@/lib/subconverter/types/policies';

export function transform(nodes: readonly (string | PolicyConfigNode)[]): PolicyConfigFields[] {
  const result: PolicyConfigFields[] = [];

  for (const node of nodes) {
    let name: string;
    let type: string;
    let rules: readonly string[];
    let providers: readonly string[] = [];
    let url: string | undefined;
    let interval: string | undefined;
    let timeout: string | undefined;
    let tolerance: string | undefined;

    if (typeof node === 'string') {
      const [groupName, groupType, ...fields] = splitFields(node, '`');

      if (fields.length === 0 || !policyGroupTypes.some((candidate) => candidate === groupType)) {
        throw new ConfigurationFieldError('policies', 'Missing policy members or unsupported policy type');
      }

      name = groupName;
      type = groupType;

      if (timedPolicyGroupTypes.some((candidate) => candidate === type)) {
        if (fields.length < 3) {
          throw new ConfigurationFieldError('policies', 'Missing policy health-check parameters');
        }

        const times = splitFields(fields.pop() ?? '', ',');

        if (times.length > 3) {
          throw new ConfigurationFieldError('policies', 'Too many health-check parameters');
        }

        url = fields.pop();
        [interval, timeout, tolerance] = times.map((value) => (value === '' ? undefined : value));
      }

      rules = fields;
    } else {
      ({ name, type, url, interval, timeout, tolerance } = node);
      rules = node.rule ?? [];
      providers = node.use ?? [];
    }

    const group: PolicyGroupFields = { name, type: 'select', members: [], providers: [...providers] };

    if (url !== undefined) {
      group.url = url;
    }

    for (const [key, value] of [
      ['interval', interval],
      ['timeout', timeout],
      ['tolerance', tolerance],
    ] as const) {
      if (value !== undefined) {
        group[key] = integer(value, key);
      }
    }

    for (const value of rules) {
      if (value.startsWith('!!PROVIDER=')) {
        group.providers.push(...splitFields(value.slice(11), ','));
      } else {
        group.members.push(
          value.startsWith('[]') ? { type: 'reference', value: value.slice(2) } : { type: 'selector', value },
        );
      }
    }

    const last = group.members.at(-1);

    if (type === 'select' && !group.url && last?.type === 'selector' && /^https?:\/\//i.test(last.value)) {
      group.url = last.value;
      group.members.pop();
    }

    try {
      result.push(readPolicyGroupFields({ ...group, type }));
    } catch (error) {
      logger.warn(error instanceof Error ? error.message : '策略字段转换失败', { data: node });

      throw error;
    }
  }

  return result;
}
