import { requireOutbound } from './outbounds';
import type { TemplateValue } from '../../../types/template';
import { CompileError, warn } from '../../diagnostics';
import type { CompileContext, TargetObject } from '../../types';
import { rulesFor } from '../rules/shared';
import { object } from '../shared';

const fields: Record<string, string> = {
  DOMAIN: 'domain',
  'DOMAIN-SUFFIX': 'domain_suffix',
  'DOMAIN-KEYWORD': 'domain_keyword',
  'DOMAIN-REGEX': 'domain_regex',
  'IP-CIDR': 'ip_cidr',
  'SRC-IP-CIDR': 'source_ip_cidr',
  'IP-VERSION': 'ip_version',
  INBOUND: 'inbound',
  PROTOCOL: 'protocol',
  NETWORK: 'network',
  'PROCESS-NAME': 'process_name',
  'PROCESS-PATH': 'process_path',
  'PACKAGE-NAME': 'package_name',
  PORT: 'port',
  'SRC-PORT': 'source_port',
  'USER-ID': 'user_id',
  'PORT-RANGE': 'port_range',
  'SRC-PORT-RANGE': 'source_port_range',
  USER: 'auth_user',
};
type Bucket = { field: string; values: (string | number)[] };

type RuleSets = { sets: TemplateValue[]; tags: Set<string>; references: Map<number, string> };

function canonical(value: TemplateValue): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(',')}]`;
  }

  if (object(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function interval(value: TemplateValue | undefined): TemplateValue {
  if (value === undefined || value === '') {
    return 86400;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const units: Record<string, number> = { ns: 1e-9, us: 1e-6, µs: 1e-6, ms: 1e-3, s: 1, m: 60, h: 3600, d: 86400 };
  const parts = [...value.matchAll(/(\d+(?:\.\d+)?)(ns|us|µs|ms|s|m|h|d)/g)];

  return parts.length && parts.map(([part]) => part).join('') === value
    ? parts.reduce((seconds, part) => seconds + Number(part[1]) * units[part[2]], 0)
    : value;
}

function definition(value: TargetObject): string {
  if (value.type !== 'remote') {
    return canonical(value);
  }

  let format = value.format;

  if ((format === undefined || format === '') && typeof value.url === 'string') {
    try {
      const path = new URL(value.url).pathname;

      format = path.endsWith('.json') ? 'source' : path.endsWith('.srs') ? 'binary' : '';
    } catch {
      format = '';
    }
  }

  const normalized: TargetObject = { ...value, format: format ?? '', update_interval: interval(value.update_interval) };

  for (const key of ['download_detour', 'http_client']) {
    if (normalized[key] === '') {
      delete normalized[key];
    }
  }

  return canonical(normalized);
}

function collectRuleSets(context: CompileContext, route: TargetObject, outbounds: ReadonlySet<string>): RuleSets {
  const sets: TemplateValue[] = [];
  const definitions = new Map<string, TargetObject>();
  const references = new Map<number, string>();
  const reserved = new Set(context.rulesets.flatMap((set) => (set.options.tag ? [set.options.tag] : [])));

  function add(value: TargetObject, field: string, index: number): void {
    const tag = value.tag;

    if (typeof tag !== 'string' || !tag) {
      throw new CompileError('INVALID_INPUT', field, index);
    }

    const previous = definitions.get(tag);

    if (previous) {
      if (definition(previous) !== definition(value)) {
        throw new CompileError('CONFLICTING_RULE_SET', field, index);
      }

      return;
    }

    definitions.set(tag, value);
    reserved.add(tag);
    sets.push(value);
  }

  if (Array.isArray(route.rule_set)) {
    for (const [index, value] of route.rule_set.entries()) {
      if (!object(value)) {
        throw new CompileError('INVALID_TEMPLATE', 'template.route.rule_set', index);
      }

      add(value, 'template.route.rule_set', index);
    }
  }

  for (const [index, set] of context.rulesets.entries()) {
    if (set.category !== 'singbox' || set.source.kind !== 'resource') {
      continue;
    }

    let tag = set.options.tag;

    if (tag === undefined) {
      const filename = new URL(set.source.address).pathname.split('/').at(-1) ?? '';
      const base = filename.replace(/\.[^.]*$/, '') || 'ruleset';
      let suffix = 2;

      tag = base;
      while (reserved.has(tag)) {
        tag = `${base}-${suffix++}`;
      }
    }

    const value: TargetObject = {
      type: 'remote',
      tag,
      url: set.source.address,
    };

    if (set.interval !== undefined) {
      value.update_interval = `${set.interval}s`;
    }

    if (set.options.format !== undefined) {
      value.format = set.options.format;
    }

    if (set.options.downloadDetour !== undefined) {
      requireOutbound(outbounds, set.options.downloadDetour, 'rulesets.options.downloadDetour', index);
      value.download_detour = set.options.downloadDetour;
    }

    add(value, 'rulesets', index);
    references.set(index, tag);
  }

  return { sets, tags: new Set(definitions.keys()), references };
}

function compileRules(
  context: CompileContext,
  route: TargetObject,
  outbounds: ReadonlySet<string>,
  { tags, references }: RuleSets,
) {
  const base = Array.isArray(route.rules) ? route.rules : [];
  const rules: TemplateValue[] = context.options.overwriteOriginalRules
    ? base.filter(
        (rule) => object(rule) && ['sniff', 'hijack-dns', 'resolve', 'route-options'].includes(String(rule.action)),
      )
    : base;

  let final: string | undefined;

  function action(group: string, index: number): TargetObject {
    if (group === 'REJECT') {
      return { action: 'reject' };
    }

    requireOutbound(outbounds, group, 'rulesets.group', index);

    return { action: 'route', outbound: group };
  }

  function reference(values: string[], group: string, index: number): void {
    if (!values.length || values.some((tag) => !tag || !tags.has(tag))) {
      throw new CompileError('INVALID_REFERENCE', 'rulesets.source.rule.parameters', index);
    }

    rules.push({ rule_set: values.length === 1 ? values[0] : values, ...action(group, index) });
  }

  for (const [index, ruleset] of context.rulesets.entries()) {
    if (ruleset.category === 'singbox') {
      if (ruleset.group) {
        reference([references.get(index)!], ruleset.group, index);
      }

      continue;
    }

    const buckets = new Map<string, Bucket>();

    for (const rule of rulesFor(context, ruleset, index)) {
      const value = (rule.parameters[0] ?? '').toLowerCase().trim();

      if (rule.type === 'MATCH' || rule.type === 'FINAL') {
        requireOutbound(outbounds, ruleset.group, 'rulesets.group', index);
        final = ruleset.group;
        continue;
      }

      if (rule.type === 'RULE-SET') {
        if (rule.flags.length) {
          throw new CompileError('UNSUPPORTED_RULE', 'rulesets.source.rule.flags', index);
        }

        reference(rule.parameters, ruleset.group, index);
        continue;
      }

      if (rule.type === 'PRIVATE') {
        if (rule.parameters.length !== 1 || !['true', 'false'].includes(rule.parameters[0]) || rule.flags.length) {
          throw new CompileError('UNSUPPORTED_RULE', 'rulesets.source.rule', index);
        }

        rules.push({ ip_is_private: rule.parameters[0] === 'true', ...action(ruleset.group, index) });
        continue;
      }

      const field = fields[rule.type];
      let item: string | number = value;

      if (!field) {
        warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
        continue;
      }

      if (['PORT', 'SRC-PORT', 'USER-ID', 'IP-VERSION'].includes(rule.type)) {
        const maximum = rule.type === 'USER-ID' ? 4294967295 : rule.type === 'IP-VERSION' ? 6 : 65535;

        if (
          !/^\d+$/.test(value) ||
          Number(value) > maximum ||
          (rule.type === 'IP-VERSION' && value !== '4' && value !== '6')
        ) {
          warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
          continue;
        }

        item = Number(value);
      }

      const bucket = buckets.get(field) ?? { field, values: [] };

      if (!bucket.values.includes(item)) {
        bucket.values.push(item);
      }

      buckets.set(field, bucket);
    }
    for (const [, bucket] of [...buckets].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const first = bucket.values[0];
      const match = typeof first === 'number' && bucket.values.length === 1 ? first : bucket.values;

      rules.push({
        [bucket.field]: match,
        ...action(ruleset.group, index),
      });
    }
  }

  return { rules, final };
}

export function singboxRoute(context: CompileContext, document: TargetObject, outbounds: ReadonlySet<string>): void {
  const route = object(document.route) ? document.route : {};
  const ruleSets = collectRuleSets(context, route, outbounds);
  const { rules, final } = compileRules(context, route, outbounds, ruleSets);

  route.rules = rules;
  route.rule_set = ruleSets.sets;
  if (final !== undefined) {
    route.final = final;
  }

  document.route = route;
}
