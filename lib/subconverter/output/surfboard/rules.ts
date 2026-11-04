import type { OutputContext, OutputElements } from '../../types/output';
import { basicRuleTypes, projectRules } from '../shared/ini-rules';

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  projectRules(rules, context, [...basicRuleTypes, 'PROCESS-NAME', 'IN-PORT', 'DST-PORT', 'SRC-IP'], {
    'DST-PORT': 'DEST-PORT',
  });
