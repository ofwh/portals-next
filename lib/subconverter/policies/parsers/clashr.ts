import { isTimed, parsePolicies, validatePolicy, withHealthCheckUrl } from '@/lib/subconverter/policies/shared/parser';
import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';

export function parse(configuration: ConfigObject): PolicyConfigFields[] {
  return parsePolicies(configuration).map((definition) => {
    const group = withHealthCheckUrl(definition);

    validatePolicy(
      group,
      ['select', 'url-test', 'fallback', 'load-balance', 'relay'],
      isTimed(group) || group.type === 'relay' ? ['url', 'interval', 'timeout', 'tolerance'] : [],
    );

    return group;
  });
}
