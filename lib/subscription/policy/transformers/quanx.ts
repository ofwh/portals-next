import { defineTransformer } from './shared';
import { fallbackResolver } from '../resolvers/fallback';
import { loadBalanceResolver } from '../resolvers/load-balance';
import { selectResolver } from '../resolvers/select';
import { ssidResolver } from '../resolvers/ssid';
import { urlTestResolver } from '../resolvers/url-test';

export const quanxTransformer = defineTransformer({
  type: 'quanx',
  label: 'Quantumult X',
  resolvers: [selectResolver, urlTestResolver, fallbackResolver, loadBalanceResolver, ssidResolver],
});
