import type { OutputContext, OutputElements } from '../../types/output';
import { ini } from '../shared/ini';

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  ini.projectRules(rules, context, [...ini.basicRuleTypes, 'PROCESS-NAME', 'IN-PORT', 'DST-PORT', 'SRC-IP'], {
    'DST-PORT': 'DEST-PORT',
  });
