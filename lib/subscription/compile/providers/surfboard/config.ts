import { CONFIG_TYPES } from '../../../shared';
import { appendSection, atom, defineConfig, proxyGroup, rule } from '../../shared/config';
import { ruleValue } from '../../shared/ini';
import { BUILTIN_REFERENCES } from '../shared';

export const config = defineConfig(
  'surfboard',
  (declaration, output) => {
    if (declaration.type === CONFIG_TYPES.PROXY_GROUP) {
      appendSection(output, 'Proxy Group', proxyGroup(declaration.value, { encode: atom }));
    } else if (declaration.type === CONFIG_TYPES.RULESET) {
      appendSection(
        output,
        'Rule',
        rule(declaration.value, {
          encode: atom,
          encodeMatch: ruleValue,
          match: !['FINAL', 'MATCH'].includes(declaration.value.kind),
        }),
      );
    } else {
      throw new Error('Custom declarations are not supported');
    }
  },
  { references: () => BUILTIN_REFERENCES, expandGroup: (entry) => !['ssid', 'subnet'].includes(entry.kind) },
);
