import logger from '@/lib/api/logger';
import type { ConfigObject, ConfigValue } from '@/lib/subconverter/types/configuration';
import { entry, objectValue, rejectImport, requiredText, section, text, texts } from '../../utils/parser';
import type { RuleSetConfigNode } from '../model/types';

function readObject(value: ConfigValue, toml = false): RuleSetConfigNode {
  const object = objectValue(value, 'rulesets');

  rejectImport(object);

  for (const item of object.entries) {
    if (!['group', 'rule', 'ruleset', 'type', 'interval', 'options', 'import'].includes(item.key)) {
      logger.warn('不支持的配置参数，已忽略', { field: item.key, data: item.values });
    }
  }

  const node: RuleSetConfigNode = { group: toml ? requiredText(object, 'group') : (text(object, 'group') ?? '') };

  for (const key of ['rule', 'ruleset', 'type', 'interval'] as const) {
    if (!toml && key === 'type') {
      const ignored = entry(object, key);

      if (ignored) {
        logger.warn('当前配置格式不支持规则类型参数，已忽略', { field: key, data: ignored.values });
      }

      continue;
    }

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
  toml: boolean;
} {
  const root = entry(configuration, 'rulesets');

  if (root) {
    return { nodes: root.values.map((value) => readObject(value, true)), toml: true };
  }

  const custom = section(configuration, 'custom');

  if (!custom) {
    return { nodes: [], toml: false };
  }

  const primary = entry(custom, 'rulesets');
  const prefixed = custom.entries.filter((item) => item.key.startsWith('ruleset'));
  const entries = primary
    ? [primary]
    : prefixed.length
      ? prefixed
      : custom.entries.filter((item) => item.key.startsWith('surge_ruleset'));

  const nodes = entries.flatMap((item) =>
    item.values.map((value) => {
      if (typeof value === 'string') {
        rejectImport(value);

        return value;
      }

      return readObject(value);
    }),
  );

  return { nodes, toml: false };
}
