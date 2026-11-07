import { clashClassicResolver } from './clash-classic';
import { clashDomainResolver } from './clash-domain';
import { clashIpcidrResolver } from './clash-ipcidr';
import { quanxResolver } from './quanx';
import { surgeResolver } from './surge';
import type { RulesetResolverModule } from './types';
import type { RuleCategory } from '../../types/ruleset';

export const rulesetResolvers: Record<RuleCategory, RulesetResolverModule> = {
  surge: surgeResolver,
  quanx: quanxResolver,
  'clash-domain': clashDomainResolver,
  'clash-ipcidr': clashIpcidrResolver,
  'clash-classic': clashClassicResolver,
};

export { surgeResolver, quanxResolver, clashDomainResolver, clashIpcidrResolver, clashClassicResolver };
