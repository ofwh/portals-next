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
import type { RuleSetConfigNode } from '@/lib/subconverter/types/rulesets';

function readObject(value: ConfigValue): RuleSetConfigNode {
  const object = objectValue(value, 'rulesets');

  rejectImport(object);

  validateFields(object, (key) => ['group', 'rule', 'ruleset', 'type', 'interval', 'options'].includes(key));

  const node: RuleSetConfigNode = {
    group: requiredText(object, 'group'),
  };

  for (const key of ['rule', 'ruleset', 'type', 'interval'] as const) {
    const value = text(object, key);

    if (value !== undefined) {
      node[key] = value;
    }
  }

  const options = texts(object, 'options');

  if (options !== undefined) {
    node.options = options;
  }

  return node;
}

export function readRulesetNodes(configuration: ConfigObject): {
  nodes: (string | RuleSetConfigNode)[];
} {
  validateRecipe(configuration);

  const root = entry(configuration, 'rulesets');

  if (root) {
    return { nodes: root.values.map((value) => readObject(value)) };
  }

  const custom = section(configuration, 'custom');

  if (!custom) {
    throw new ConfigurationFieldError('configuration', 'Missing configuration section');
  }

  const primary = entry(custom, 'rulesets');
  const prefixed = custom.entries.filter((item) => item.key.startsWith('ruleset'));
  const entries = primary
    ? [primary]
    : prefixed.length
      ? prefixed
      : custom.entries.filter((item) => item.key.startsWith('surge_ruleset'));

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
