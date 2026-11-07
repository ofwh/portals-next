import { defineTransformer } from './shared';
import { clashClassicResolver } from '../resolvers/clash-classic';
import { clashDomainResolver } from '../resolvers/clash-domain';
import { clashIpcidrResolver } from '../resolvers/clash-ipcidr';

export const clashTransformer = defineTransformer({
  type: 'clash',
  resolvers: [clashDomainResolver, clashIpcidrResolver, clashClassicResolver],
  inlineResolver: clashClassicResolver,
});
