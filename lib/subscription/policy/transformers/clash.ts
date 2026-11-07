import { defineTransformer } from './shared';
import { fallbackResolver } from '../resolvers/fallback';
import { loadBalanceResolver } from '../resolvers/load-balance';
import { relayResolver } from '../resolvers/relay';
import { selectResolver } from '../resolvers/select';
import { smartResolver } from '../resolvers/smart';
import { urlTestResolver } from '../resolvers/url-test';

export const clashTransformer = defineTransformer({
  type: 'clash',
  label: 'Clash',
  resolvers: [selectResolver, urlTestResolver, smartResolver, fallbackResolver, loadBalanceResolver, relayResolver],
});
