import { defineTransformer } from './shared';
import { fallbackResolver } from '../resolvers/fallback';
import { loadBalanceResolver } from '../resolvers/load-balance';
import { selectResolver } from '../resolvers/select';
import { urlTestResolver } from '../resolvers/url-test';

export const singboxTransformer = defineTransformer({
  type: 'singbox',
  label: 'sing-box',
  resolvers: [selectResolver, urlTestResolver, fallbackResolver, loadBalanceResolver],
});
