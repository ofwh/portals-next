import { defineTransformer } from './shared';
import { fallbackResolver } from '../resolvers/fallback';
import { loadBalanceResolver } from '../resolvers/load-balance';
import { remoteFilterResolver } from '../resolvers/remote-filter';
import { selectResolver } from '../resolvers/select';
import { ssidResolver } from '../resolvers/ssid';
import { urlTestResolver } from '../resolvers/url-test';

export const loonTransformer = defineTransformer({
  type: 'loon',
  label: 'Loon',
  resolvers: [
    selectResolver,
    urlTestResolver,
    fallbackResolver,
    loadBalanceResolver,
    ssidResolver,
    remoteFilterResolver,
  ],
});
