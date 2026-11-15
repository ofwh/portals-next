import { CONFIG_TYPES } from '../../../shared';
import { appendSection, defineConfig, proxyGroup, rule } from '../../shared/config';

export const config = defineConfig('surfboard', (declaration, output) => {
  if (declaration.type === CONFIG_TYPES.PROXY_GROUP) {
    appendSection(output, 'Proxy Group', proxyGroup(declaration.value, 'surfboard'));
  } else if (declaration.type === CONFIG_TYPES.RULESET) {
    appendSection(output, 'Rule', rule(declaration.value));
  } else {
    throw new Error('Custom declarations are not supported');
  }
});
