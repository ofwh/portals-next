import { defineTransformer } from './shared';
import { fallbackResolver } from '../resolvers/fallback';
import { loadBalanceResolver } from '../resolvers/load-balance';
import { relayResolver } from '../resolvers/relay';
import { selectResolver } from '../resolvers/select';
import { urlTestResolver } from '../resolvers/url-test';

export const stashTransformer = defineTransformer({
  type: 'stash',
  label: 'Stash',
  resolvers: [selectResolver, urlTestResolver, fallbackResolver, loadBalanceResolver, relayResolver],
});
