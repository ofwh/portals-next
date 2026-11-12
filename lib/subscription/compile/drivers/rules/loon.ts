import { rulesFor, supportsRule } from './shared';
import { ruleDelivery } from '../../../shared/compile';
import type { Rule, RuleSet } from '../../../types/ruleset';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { loonValue } from '../loon';
import { writeSection } from '../shared';

const loonRuleTypes = [
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'DOMAIN-WILDCARD',
  'IP-CIDR',
  'SRC-IP-CIDR',
  'GEOIP',
  'IP-ASN',
  'MATCH',
  'FINAL',
  'IP-CIDR6',
  'USER-AGENT',
  'URL-REGEX',
  'PROCESS-NAME',
  'IN-PORT',
  'DEST-PORT',
  'SRC-PORT',
  'SRC-IP',
  'PROTOCOL',
  'AND',
  'OR',
  'NOT',
];

const aliases: Record<string, string> = { MATCH: 'FINAL', 'IP6-CIDR': 'IP-CIDR6', 'DST-PORT': 'DEST-PORT' };
const ipRuleTypes = new Set(['IP-CIDR', 'IP-CIDR6', 'GEOIP', 'IP-ASN']);

export function loonTextRule(context: CompileContext, rule: Rule, ruleset: RuleSet, index: number): string | undefined {
  const type = aliases[rule.type] ?? rule.type;

  if (!supportsRule(context, { ...rule, type }, loonRuleTypes, false, index, true)) {
    return;
  }

  const noResolve = ipRuleTypes.has(type) && (ruleset.options.noResolve || rule.flags.includes('no-resolve'));

  if (rule.flags.some((flag) => flag !== 'no-resolve')) {
    warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
  }

  const logical = ['AND', 'OR', 'NOT'].includes(type);
  const parameters = logical ? rule.parameters : rule.parameters.map((value) => loonValue(value));

  return [type, ...parameters, loonValue(ruleset.group), ...(noResolve ? ['no-resolve'] : [])].join(',');
}

export function loonRules(context: CompileContext, document: IniDocument): void {
  if (context.options.overwriteOriginalRules) {
    writeSection(document, 'Rule', [], true);
    writeSection(document, 'Remote Rule', [], true);
  }

  const output: string[] = [];

  for (const [index, ruleset] of context.rulesets.entries()) {
    const delivery = ruleDelivery('loon', ruleset);

    if (delivery === 'skip') {
      warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
      continue;
    }

    if (delivery === 'remote' && ruleset.source.kind === 'resource') {
      writeSection(document, 'Remote Rule', [
        `${loonValue(ruleset.source.address)}, policy=${loonValue(ruleset.group)}, enabled=true`,
      ]);
      continue;
    }

    for (const rule of rulesFor(context, ruleset, index)) {
      const value = loonTextRule(context, rule, ruleset, index);

      if (value !== undefined) {
        output.push(value);
      }
    }
  }

  writeSection(document, 'Rule', output);
}
