import { basicRuleTypes, projectRules } from '../shared/ini-rules';
import type { OutputContext, OutputElements } from '../types';

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  projectRules(rules, context, [...basicRuleTypes, 'PROCESS-NAME', 'IN-PORT', 'DST-PORT', 'SRC-IP'], {
    'DST-PORT': 'DEST-PORT',
  });
