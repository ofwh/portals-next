import { CONFIG_TYPES } from '../../../shared';
import {
  appendSection,
  atom,
  bind,
  defineConfig,
  options,
  positional,
  proxyGroup,
  rule,
  text,
} from '../../shared/config';

export const config = defineConfig('quanx', (declaration, output) => {
  const entry = declaration.value;

  if (declaration.type === CONFIG_TYPES.PROXY_GROUP) {
    appendSection(output, 'policy', proxyGroup(declaration.value, 'quanx'));
  } else if (declaration.type === CONFIG_TYPES.RULESET) {
    if (declaration.value.kind !== 'RULE-SET') {
      appendSection(output, 'filter_local', rule(declaration.value, true));

      return;
    }

    const values = positional(entry);
    const fields = options(entry);

    if (entry.name || Object.hasOwn(fields, 'force-policy')) {
      bind(fields, 'force-policy', entry.name);
    }

    if (!entry.name) {
      delete fields['force-policy'];
    }

    appendSection(
      output,
      'filter_remote',
      [
        ...values.map(atom),
        ...Object.entries(fields).map(([key, value]) =>
          key === 'require-devices'
            ? `${key}=${(Array.isArray(value) ? value : [value]).map(text).join(',')}`
            : `${atom(key)}=${atom(value)}`,
        ),
      ].join(','),
    );
  } else {
    throw new Error('Custom declarations are not supported');
  }
});
