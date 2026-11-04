import { fail } from '../shared/errors';
import { boundRules } from '../shared/rules';
import type { RuleCondition } from '../shared/rules';
import type { NativeObject, OutputContext, OutputElements } from '../types';

export interface RuleProjection {
  rules: NativeObject[];
  final?: string;
}
const fields: Record<string, string> = {
  DOMAIN: 'domain',
  'DOMAIN-SUFFIX': 'domain_suffix',
  'DOMAIN-KEYWORD': 'domain_keyword',
  'DOMAIN-REGEX': 'domain_regex',
  'IP-CIDR': 'ip_cidr',
  'IP-CIDR6': 'ip_cidr',
  'SRC-IP-CIDR': 'source_ip_cidr',
  'DST-PORT': 'port',
  'SRC-PORT': 'source_port',
  'PORT-RANGE': 'port_range',
  'SRC-PORT-RANGE': 'source_port_range',
  'PROCESS-NAME': 'process_name',
  'PROCESS-PATH': 'process_path',
  'PACKAGE-NAME': 'package_name',
  'IP-VERSION': 'ip_version',
  INBOUND: 'inbound',
  PROTOCOL: 'protocol',
  NETWORK: 'network',
  USER: 'auth_user',
  'USER-ID': 'user_id',
};

function project(condition: RuleCondition, index: number): NativeObject {
  if (condition.noResolve) {
    return fail('rule', index, 'noResolve', 'no-resolve-not-supported');
  }

  if (condition.children) {
    return {
      type: 'logical',
      mode: condition.type === 'OR' ? 'or' : 'and',
      ...(condition.type === 'NOT' ? { invert: true } : {}),
      rules: condition.children.map((child) => project(child, index)),
    };
  }

  if ((condition.type === 'GEOIP' || condition.type === 'SRC-GEOIP') && condition.value === 'private') {
    return { [condition.type === 'GEOIP' ? 'ip_is_private' : 'source_ip_is_private']: true };
  }

  const field = fields[condition.type];

  if (!field || condition.value === undefined) {
    return fail('rule', index, 'rule', 'unsupported-singbox-rule');
  }

  if (['port', 'source_port', 'ip_version', 'user_id'].includes(field)) {
    const number = Number(condition.value);

    if (
      !/^\d+$/.test(condition.value) ||
      !Number.isSafeInteger(number) ||
      number < 0 ||
      ((field === 'port' || field === 'source_port') && (number < 1 || number > 65535)) ||
      (field === 'ip_version' && number !== 4 && number !== 6)
    ) {
      return fail('rule', index, 'value', 'invalid-numeric-rule');
    }

    return { [field]: number };
  }

  if (field === 'port_range' || field === 'source_port_range') {
    const range = /^(\d+):(\d+)$/.exec(condition.value);

    if (!range || Number(range[1]) < 1 || Number(range[2]) > 65535 || Number(range[1]) > Number(range[2])) {
      return fail('rule', index, 'value', 'invalid-port-range');
    }
  }

  return { [field]: condition.value };
}

export function transform(rules: OutputElements['rules'], context: OutputContext) {
  const value: RuleProjection = { rules: [] };

  for (const { condition, policy, index } of boundRules(rules, context)) {
    if (condition.noResolve) {
      return fail('rule', index, 'noResolve', 'no-resolve-not-supported');
    }

    if (condition.type === 'MATCH') {
      if (policy === 'REJECT') {
        value.rules.push({ action: 'reject' });
        continue;
      }

      value.final = policy;
    } else {
      value.rules.push({
        ...project(condition, index),
        action: policy === 'REJECT' ? 'reject' : 'route',
        ...(policy === 'REJECT' ? {} : { outbound: policy }),
      });
    }
  }

  return { value, issues: [] };
}
