import { CONFIG_TYPES } from '../../../shared';
import { appendValue, bind, defineConfig, namedOnly, objectValue, options, positional } from '../../shared/config';
import { BUILTIN_REFERENCES } from '../shared';

export const config = defineConfig(
  'singbox',
  (declaration, output) => {
    if (declaration.type === CONFIG_TYPES.PROXY_GROUP) {
      const { name } = declaration.value;
      const fields = options(declaration.value);

      bind(fields, 'type', declaration.value.kind);
      bind(fields, 'tag', name);
      fields.outbounds = positional(declaration.value);
      appendValue(output.value, 'outbounds', fields);

      return;
    }

    const fields = namedOnly(declaration.value);
    const route = objectValue(output.value, 'route');

    if (declaration.type === CONFIG_TYPES.CUSTOM) {
      bind(fields, 'action', declaration.value.kind);
      appendValue(route, 'rules', fields);
    } else if (declaration.value.kind === 'FINAL') {
      route.final = declaration.value.name;
    } else {
      if (!['INLINE', 'LOCAL', 'REMOTE'].includes(declaration.value.kind)) {
        throw new Error('Unsupported rule-set kind');
      }

      bind(fields, 'type', declaration.value.kind.toLowerCase());
      bind(fields, 'tag', declaration.value.name);
      appendValue(route, 'rule_set', fields);
    }
  },
  {
    references: () => BUILTIN_REFERENCES,
    expandGroup: (entry) => !['ssid', 'subnet'].includes(entry.kind),
    memberParameters: ['proxies', 'outbounds'],
    nodeName: (node) => node.value.tag,
  },
);
