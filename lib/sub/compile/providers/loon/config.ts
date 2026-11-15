import { CONFIG_TYPES } from '../../../shared';
import {
  appendSection,
  atom,
  bind,
  defineConfig,
  namedOnly,
  options,
  positional,
  proxyGroup,
  quote,
  rule,
} from '../../shared/config';

export const config = defineConfig('loon', (declaration, output) => {
  const entry = declaration.value;

  if (declaration.type === CONFIG_TYPES.PROXY_GROUP) {
    appendSection(output, 'Proxy Group', proxyGroup(declaration.value, 'loon'));
  } else if (declaration.type === CONFIG_TYPES.RULESET) {
    if (declaration.value.kind !== 'RULE-SET') {
      appendSection(output, 'Rule', rule(declaration.value));

      return;
    }

    const values = positional(entry);
    const fields = options(entry);

    if (entry.name || Object.hasOwn(fields, 'policy')) {
      bind(fields, 'policy', entry.name);
    }

    if (!entry.name) {
      delete fields.policy;
    }

    appendSection(
      output,
      'Remote Rule',
      [...values.map(atom), ...Object.entries(fields).map(([key, value]) => `${atom(key)}=${atom(value)}`)].join(','),
    );
  } else {
    const fields = namedOnly(entry);
    const { mode, subscription, FilterKey, ...rest } = fields;
    const subscriptions = subscription === undefined ? [] : Array.isArray(subscription) ? subscription : [subscription];
    const values = [
      ...(mode === undefined ? [] : [atom(mode)]),
      ...subscriptions.map(atom),
      ...(FilterKey === undefined ? [] : [`FilterKey=${quote(FilterKey)}`]),
      ...Object.entries(rest).map(([key, value]) => `${atom(key)}=${atom(value)}`),
    ];

    appendSection(output, 'Remote Filter', `${atom(entry.name)} = ${values.join(',')}`);
  }
});
