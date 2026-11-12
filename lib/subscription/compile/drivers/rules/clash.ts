import { Buffer } from 'node:buffer';
import { supportsRule } from './shared';
import { ruleDelivery } from '../../../shared/compile';
import type { Rule, RuleCategory, RuleSet } from '../../../types/ruleset';
import { CompileError, warn } from '../../diagnostics';
import type { CompileContext, TargetObject } from '../../types';
import { object } from '../shared';

const clashRuleTypes = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'SRC-IP-CIDR',
  'GEOIP',
  'MATCH',
  'FINAL',
  'IP-CIDR6',
  'SRC-PORT',
  'DST-PORT',
  'PROCESS-NAME',
  'DOMAIN-REGEX',
  'GEOSITE',
  'IP-SUFFIX',
  'IP-ASN',
  'SRC-GEOIP',
  'SRC-IP-ASN',
  'SRC-IP-SUFFIX',
  'IN-PORT',
  'IN-TYPE',
  'IN-USER',
  'IN-NAME',
  'PROCESS-PATH-REGEX',
  'PROCESS-PATH',
  'PROCESS-NAME-REGEX',
  'UID',
  'NETWORK',
  'DSCP',
  'SUB-RULE',
  'RULE-SET',
  'AND',
  'OR',
  'NOT',
];

const behaviors: Partial<Record<RuleCategory, string>> = {
  'clash-domain': 'domain',
  'clash-ipcidr': 'ipcidr',
  'clash-classic': 'classical',
};

function providerName(address: string): string {
  let separator = address.lastIndexOf('/');

  if (separator < 0) {
    separator = Math.max(0, address.lastIndexOf('\\'));
  }

  const extension = address.lastIndexOf('.');
  const end = extension < separator ? address.length : extension;
  const filename = Buffer.from(address.slice(separator + 1, end));
  const decoded: number[] = [];

  for (let index = 0; index < filename.length; index++) {
    let byte = filename[index];

    if (byte === 0x2b) {
      byte = 0x20;
    } else if (byte === 0x25 && index + 2 < filename.length) {
      const hex = String.fromCharCode(filename[index + 1], filename[index + 2]);

      if (/^[\da-f]{2}$/i.test(hex)) {
        byte = parseInt(hex, 16);
        index += 2;
      }
    }

    if (byte !== 0x0d && byte !== 0x0a) {
      decoded.push(byte);
    }
  }

  return Buffer.from(decoded).toString('utf8');
}

function fingerprint(address: string): string {
  let hash = BigInt('0xcbf29ce484222325');

  for (const byte of Buffer.from(address)) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * BigInt('0x100000001b3'));
  }

  return hash.toString(16).padStart(16, '0');
}

function pathKey(path: string): string {
  return path
    .replaceAll('\\', '/')
    .replace(/^(?:\.\/)+/, '')
    .toLowerCase();
}

function providerPath(name: string, behavior: string, address: string, extension: string, paths: Set<string>): string {
  const safeName =
    name
      .replace(/[^A-Za-z0-9._-]+/g, '_')
      .replace(/^[._-]+|[._-]+$/g, '')
      .slice(0, 64)
      .replace(/[._-]+$/, '') || 'provider';
  const hash = fingerprint(address);
  let index = 2;
  let path = `./providers/${safeName}-${behavior}-${hash}.${extension}`;

  while (paths.has(pathKey(path))) {
    path = `./providers/${safeName}-${index++}-${behavior}-${hash}.${extension}`;
  }
  paths.add(pathKey(path));

  return path;
}

export function clashRules(context: CompileContext, document: TargetObject): string[] {
  const output: string[] = [];
  const providers = object(document['rule-providers']) ? document['rule-providers'] : {};
  const names = new Set<string>();
  const paths = new Set(
    Object.values(providers)
      .filter(object)
      .flatMap((provider) => (typeof provider.path === 'string' ? [pathKey(provider.path)] : [])),
  );
  let generated = false;

  for (const [index, ruleset] of context.rulesets.entries()) {
    if (ruleset.source.kind === 'inline') {
      const rule = clashTextRule(context, ruleset.source.rule, ruleset, true, index);

      if (rule !== undefined) {
        output.push(rule);
      }

      continue;
    }

    if (ruleDelivery('clash', ruleset) !== 'remote') {
      warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
      continue;
    }

    const address = ruleset.source.address;
    let url: URL;

    try {
      url = new URL(address);
    } catch {
      throw new CompileError('INVALID_RESOURCE', 'rulesets', index);
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new CompileError('INVALID_RESOURCE', 'rulesets', index);
    }

    const base = providerName(address);
    let name = base;
    let suffix = 2;

    while (names.has(name)) {
      name = `${base} ${suffix++}`;
    }
    names.add(name);
    const behavior = behaviors[ruleset.category]!;
    const extension = /\.mrs$/i.test(url.pathname) ? 'mrs' : /\.txt$/i.test(url.pathname) ? 'txt' : 'yaml';
    const format = extension === 'txt' ? 'text' : extension;
    const existing = providers[name];
    const provider: TargetObject = {
      ...(object(existing) ? existing : {}),
      type: 'http',
      behavior,
      url: address,
      path: providerPath(name, behavior, address, extension, paths),
    };

    if (/\.(?:mrs|txt|ya?ml)$/i.test(url.pathname)) {
      provider.format = format;
    }

    if (ruleset.interval) {
      provider.interval = ruleset.interval;
    }

    Object.defineProperty(providers, name, { value: provider, enumerable: true, configurable: true, writable: true });
    generated = true;
    output.push(
      `RULE-SET,${name},${ruleset.group}${ruleset.category === 'clash-ipcidr' && ruleset.options.noResolve ? ',no-resolve' : ''}`,
    );
  }
  if (generated) {
    document['rule-providers'] = providers;
  }

  return output;
}

export function clashTextRule(
  context: CompileContext,
  rule: Rule,
  ruleset: RuleSet,
  inline: boolean,
  index: number,
): string | undefined {
  if (!supportsRule(context, rule, clashRuleTypes, inline, index)) {
    return;
  }

  if (rule.type === 'MATCH' || rule.type === 'FINAL') {
    return `MATCH,${ruleset.group}`;
  }

  if (
    ['AND', 'OR', 'NOT', 'SUB-RULE', 'DOMAIN-REGEX', 'PROCESS-NAME-REGEX', 'PROCESS-PATH-REGEX'].includes(rule.type)
  ) {
    return [rule.type, ...rule.parameters, ...rule.flags, ruleset.group].join(',');
  }

  const flags = rule.flags.slice(0, 1);

  if (
    !inline &&
    ruleset.options.noResolve &&
    ruleset.category === 'clash-ipcidr' &&
    ['IP-CIDR', 'IP-CIDR6'].includes(rule.type) &&
    !flags.includes('no-resolve')
  ) {
    flags.push('no-resolve');
  }

  return [rule.type, ...rule.parameters, ruleset.group, ...flags].join(',');
}
