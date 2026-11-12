import { clashClassicResolver } from './clash-classic';
import { clashDomainResolver } from './clash-domain';
import { clashIpcidrResolver } from './clash-ipcidr';
import { loonResolver } from './loon';
import { quanxResolver } from './quanx';
import { surgeResolver } from './surge';
import type { RulesetResolverModule } from './types';
import type { RuleContentCategory } from '../../types/ruleset';

export const rulesetResolvers: Record<RuleContentCategory, RulesetResolverModule> = {
  surge: surgeResolver,
  loon: loonResolver,
  quanx: quanxResolver,
  'clash-domain': clashDomainResolver,
  'clash-ipcidr': clashIpcidrResolver,
  'clash-classic': clashClassicResolver,
};

export { surgeResolver, loonResolver, quanxResolver, clashDomainResolver, clashIpcidrResolver, clashClassicResolver };
