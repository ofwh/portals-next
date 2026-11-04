import { basicRuleTypes, projectRules } from '../shared/ini-rules';
import type { OutputContext, OutputElements } from '../types';

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  projectRules(rules, context, [...basicRuleTypes, 'USER-AGENT', 'URL-REGEX', 'PROCESS-NAME', 'DST-PORT', 'SRC-PORT'], {
    'DST-PORT': 'DEST-PORT',
  });
