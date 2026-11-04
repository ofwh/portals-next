import type { OutputContext, OutputElements } from '../../types/output';
import { basicRuleTypes, projectRules } from '../shared/ini-rules';

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  projectRules(
    rules,
    context,
    [...basicRuleTypes, 'USER-AGENT'],
    { DOMAIN: 'HOST', 'DOMAIN-SUFFIX': 'HOST-SUFFIX', 'DOMAIN-KEYWORD': 'HOST-KEYWORD', 'IP-CIDR6': 'IP6-CIDR' },
    true,
  );
