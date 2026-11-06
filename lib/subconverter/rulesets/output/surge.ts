import { ini } from '@/lib/subconverter/output/shared/ini';
import type { OutputContext, OutputElements } from '@/lib/subconverter/types/output';

export const ruleTypes = [
  ...ini.basicRuleTypes,
  'USER-AGENT',
  'URL-REGEX',
  'AND',
  'OR',
  'NOT',
  'PROCESS-NAME',
  'IN-PORT',
  'DST-PORT',
  'SRC-IP',
];

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  ini.projectRules(rules, context, ruleTypes, { 'DST-PORT': 'DEST-PORT' });
