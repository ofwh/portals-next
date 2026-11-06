import {
  ConfigurationFieldError,
  entry,
  objectValue,
  rejectImport,
  requiredText,
  section,
  text,
  texts,
  validateFields,
  validateRecipe,
} from '@/lib/subconverter/configuration/fields';
import type { ConfigObject, ConfigValue } from '@/lib/subconverter/types/configuration';
import type { PolicyConfigNode } from '@/lib/subconverter/types/policies';

function readObject(value: ConfigValue): PolicyConfigNode {
  const object = objectValue(value, 'policies');

  rejectImport(object);

  validateFields(object, (key) =>
    ['name', 'type', 'rule', 'use', 'url', 'interval', 'timeout', 'tolerance'].includes(key),
  );

  const node: PolicyConfigNode = {
    name: requiredText(object, 'name'),
    type: requiredText(object, 'type'),
    rule: texts(object, 'rule') ?? [],
    use: texts(object, 'use') ?? [],
  };

  for (const key of ['url', 'interval', 'timeout', 'tolerance'] as const) {
    const value = text(object, key);

    if (value !== undefined) {
      node[key] = value;
    }
  }

  return node;
}

export function readPolicyNodes(configuration: ConfigObject): { nodes: (string | PolicyConfigNode)[] } {
  validateRecipe(configuration);

  const root = entry(configuration, 'custom_groups');

  if (root) {
    return { nodes: root.values.map((value) => readObject(value)) };
  }

  const custom = section(configuration, 'custom');

  if (!custom) {
    throw new ConfigurationFieldError('configuration', 'Missing configuration section');
  }

  const primary = entry(custom, 'proxy_groups');
  const entries = primary ? [primary] : custom.entries.filter((item) => item.key.startsWith('custom_proxy_group'));

  if (entries.length === 0) {
    throw new ConfigurationFieldError('configuration', 'Missing configuration section');
  }

  const nodes = entries.flatMap((item) =>
    item.values.map((value) => {
      if (typeof value === 'string') {
        rejectImport(value);

        return value;
      }

      return readObject(value);
    }),
  );

  return { nodes };
}
