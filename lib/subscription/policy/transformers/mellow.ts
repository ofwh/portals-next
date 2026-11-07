import { defineTransformer } from './shared';
import { fallbackResolver } from '../resolvers/fallback';
import { loadBalanceResolver } from '../resolvers/load-balance';
import { selectResolver } from '../resolvers/select';
import { urlTestResolver } from '../resolvers/url-test';

export const mellowTransformer = defineTransformer({
  type: 'mellow',
  label: 'Mellow',
  resolvers: [selectResolver, urlTestResolver, fallbackResolver, loadBalanceResolver],
});
