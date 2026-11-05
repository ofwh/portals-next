import type { OutputContext, OutputElements } from '../../types/output';
import { ini } from '../shared/ini';

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  ini.projectRules(
    rules,
    context,
    [...ini.basicRuleTypes, 'USER-AGENT', 'URL-REGEX', 'PROCESS-NAME', 'DST-PORT', 'SRC-PORT'],
    {
      'DST-PORT': 'DEST-PORT',
    },
  );
