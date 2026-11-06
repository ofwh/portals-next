import { ini } from '@/lib/subconverter/output/shared/ini';
import type { OutputContext, OutputElements } from '@/lib/subconverter/types/output';

export const ruleTypes = [...ini.basicRuleTypes, 'USER-AGENT'];

export const transform = (rules: OutputElements['rules'], context: OutputContext) =>
  ini.projectRules(
    rules,
    context,
    ruleTypes,
    { DOMAIN: 'HOST', 'DOMAIN-SUFFIX': 'HOST-SUFFIX', 'DOMAIN-KEYWORD': 'HOST-KEYWORD', 'IP-CIDR6': 'IP6-CIDR' },
    true,
  );
