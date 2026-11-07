import { defineTransformer } from './shared';
import { fallbackResolver } from '../resolvers/fallback';
import { loadBalanceResolver } from '../resolvers/load-balance';
import { selectResolver } from '../resolvers/select';
import { smartResolver } from '../resolvers/smart';
import { ssidResolver } from '../resolvers/ssid';
import { urlTestResolver } from '../resolvers/url-test';

export const surgeTransformer = defineTransformer({
  type: 'surge',
  label: 'Surge',
  resolvers: [selectResolver, urlTestResolver, smartResolver, fallbackResolver, loadBalanceResolver, ssidResolver],
});
