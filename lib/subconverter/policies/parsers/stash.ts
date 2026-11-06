import { isTimed, parsePolicies, validatePolicy } from '@/lib/subconverter/policies/shared/parser';
import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';

export function parse(configuration: ConfigObject): PolicyConfigFields[] {
  return parsePolicies(configuration).map((group) => {
    validatePolicy(
      group,
      ['select', 'url-test', 'fallback', 'load-balance', 'relay'],
      group.type === 'relay' ? ['url', 'interval', 'timeout'] : isTimed(group) ? ['interval'] : [],
    );

    return group;
  });
}
