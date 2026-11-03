import type { ConfigObject } from '@/lib/subconverter/configuration/types';
import { splitFields } from '@/lib/subconverter/providers/ini/utils';
import { readPolicyNodes } from './dataset';
import { ConfigurationFieldError, integer } from '../../../utils/configuration';
import { readPolicyGroupFields } from '../model/fields';
import type { PolicyGroupFields } from '../model/fields-types';
import { policyGroupTypes, timedPolicyGroupTypes } from '../model/options';
import type { PolicyConfigFields, PolicyConfigNode } from '../model/types';

function adaptObject(original: PolicyConfigNode, toml: boolean): PolicyConfigNode | undefined {
  const node = { ...original };

  const supported = policyGroupTypes.some((type) => type === node.type);

  if (!supported) {
    if (toml) {
      throw new ConfigurationFieldError('type', 'Unsupported policy type');
    }

    return undefined;
  }

  const rules = node.rule ?? [];
  const timed = timedPolicyGroupTypes.some((type) => type === node.type);

  if (toml) {
    if (timed && (node.url === undefined || node.interval === undefined)) {
      throw new ConfigurationFieldError('policies', 'Timed policies require url and interval');
    }

    node.timeout ??= '5';

    if (rules.length === 0 && node.use?.length === 0) {
      throw new ConfigurationFieldError('policies', 'A policy requires members or providers');
    }

    if (
      node.type === 'select' &&
      !node.url &&
      rules.length === 1 &&
      /^https?:\/\//i.test(rules[0]) &&
      node.use?.length === 0
    ) {
      throw new ConfigurationFieldError('policies', 'A policy requires members after extracting the health-check URL');
    }
  } else {
    // YAML readGroup 不转发 use；其最少成员数与 INI 绑定器不同。
    node.use = [];

    if (rules.length < (node.type === 'ssid' ? 2 : 1)) {
      return undefined;
    }

    if (timed) {
      node.url ??= 'https://www.gstatic.com/generate_204';
      node.interval ??= '300';
    } else if (node.type === 'select' || node.type === 'ssid') {
      delete node.url;
      delete node.interval;
      delete node.timeout;
      delete node.tolerance;
    } else if (node.type === 'relay') {
      node.rule = [
        ...rules,
        node.url ?? 'https://www.gstatic.com/generate_204',
        `${node.interval ?? '300'},${node.timeout ?? ''},${node.tolerance ?? ''}`,
      ];
      delete node.url;
      delete node.interval;
      delete node.timeout;
      delete node.tolerance;
    }
  }

  return node;
}

function transform(nodes: readonly (string | PolicyConfigNode)[]): PolicyConfigFields[] {
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
        continue;
      }

      name = groupName;
      type = groupType;

      if (timedPolicyGroupTypes.some((candidate) => candidate === type)) {
        if (fields.length < 3) {
          continue;
        }

        const times = splitFields(fields.pop() ?? '', ',');

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

    const timed = timedPolicyGroupTypes.some((candidate) => candidate === type);

    for (const [key, value] of [
      ['interval', interval],
      ['timeout', timeout],
      ['tolerance', tolerance],
    ] as const) {
      if (timed || value !== undefined) {
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

    result.push(readPolicyGroupFields({ ...group, type }));
  }

  return result;
}

export function parse(configuration: ConfigObject): PolicyConfigFields[] {
  const { nodes, toml } = readPolicyNodes(configuration);
  const adapted = nodes.flatMap((node): (string | PolicyConfigNode)[] => {
    if (typeof node === 'string') {
      return [node];
    }

    const value = adaptObject(node, toml);

    return value ? [value] : [];
  });

  return transform(adapted);
}
