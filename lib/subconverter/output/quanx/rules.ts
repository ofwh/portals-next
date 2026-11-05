import type { OutputContext, OutputElements } from '../../types/output';
import { ini } from '../shared/ini';

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  ini.projectRules(
    rules,
    context,
    [...ini.basicRuleTypes, 'USER-AGENT'],
    { DOMAIN: 'HOST', 'DOMAIN-SUFFIX': 'HOST-SUFFIX', 'DOMAIN-KEYWORD': 'HOST-KEYWORD', 'IP-CIDR6': 'IP6-CIDR' },
    true,
  );
