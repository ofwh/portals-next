import { rulesFor } from './shared';
import type { TemplateValue } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext, TargetObject } from '../../types';
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
type Bucket = { field: string; values: (string | number | boolean)[]; source: boolean };

export function singboxRules(context: CompileContext, document: TargetObject): void {
  const route = object(document.route) ? document.route : {};
  const base = Array.isArray(route.rules) ? route.rules : [];
  const rules: TemplateValue[] = context.options.overwriteOriginalRules
    ? base.filter(
        (rule) => object(rule) && ['sniff', 'hijack-dns', 'resolve', 'route-options'].includes(String(rule.action)),
      )
    : base;

  rules.push(
    { clash_mode: 'Global', action: 'route', outbound: 'GLOBAL' },
    { clash_mode: 'Direct', action: 'route', outbound: 'DIRECT' },
  );
  const codes = { geosite: new Set<string>(), geoip: new Set<string>() };
  let final = '';

  for (const [index, ruleset] of context.rulesets.entries()) {
    const buckets = new Map<string, Bucket>();

    for (const rule of rulesFor(context, ruleset, index)) {
      const value = (rule.parameters[0] ?? '').toLowerCase().trim();

      if (rule.type === 'MATCH' || rule.type === 'FINAL') {
        final = ruleset.group;
        continue;
      }

      let field = fields[rule.type];
      let item: string | number | boolean = value;
      let source = false;

      if (rule.type === 'GEOSITE' || rule.type === 'GEOIP' || rule.type === 'SRC-GEOIP') {
        const family = rule.type === 'GEOSITE' ? 'geosite' : 'geoip';

        if (family === 'geoip' && value === 'private') {
          field = rule.type === 'SRC-GEOIP' ? 'source_ip_is_private' : 'ip_is_private';
          item = true;
        } else {
          if (!/^[a-z0-9][a-z0-9._@!+-]*$/.test(value)) {
            warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
            continue;
          }

          field = 'rule_set';
          item = `${family}-${value}`;
          source = rule.type === 'SRC-GEOIP';
          codes[family].add(value);
        }
      }

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

      const key = `${field}:${source ? 'source' : 'destination'}`;
      const bucket = buckets.get(key) ?? { field, values: [], source };

      if (!bucket.values.includes(item)) {
        bucket.values.push(item);
      }

      buckets.set(key, bucket);
    }
    for (const [, bucket] of [...buckets].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
      const first = bucket.values[0];
      const match =
        typeof first === 'boolean'
          ? true
          : typeof first === 'number' && bucket.values.length === 1
            ? first
            : bucket.values;

      rules.push({
        [bucket.field]: match,
        ...(bucket.source ? { rule_set_ip_cidr_match_source: true } : {}),
        action: 'route',
        outbound: ruleset.group,
      });
    }
  }
  const sets = Array.isArray(route.rule_set) ? route.rule_set : [];
  const tags = new Set(sets.filter(object).map((item) => item.tag));
  const firstClient = Array.isArray(document.http_clients) ? document.http_clients[0] : undefined;
  const client =
    typeof route.default_http_client === 'string'
      ? route.default_http_client
      : object(firstClient) && typeof firstClient.tag === 'string'
        ? firstClient.tag
        : '';

  if (client) {
    for (const item of sets) {
      if (object(item) && item.type === 'remote') {
        delete item.download_detour;
        item.http_client = client;
      }
    }
  }

  for (const family of ['geosite', 'geoip'] as const) {
    for (const code of [...codes[family]].sort()) {
      const tag = `${family}-${code}`;

      if (!tags.has(tag)) {
        sets.push({
          type: 'remote',
          tag,
          format: 'binary',
          url: `https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/sing/geo/${family}/${code}.srs`,
          ...(client ? { http_client: client } : { download_detour: 'DIRECT' }),
        });
        tags.add(tag);
      }
    }
  }
  route.rules = rules;
  route.rule_set = sets;
  route.final = final;
  document.route = route;
}
