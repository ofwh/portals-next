import logger from '@/lib/api/logger';
import type { ConfigObject, ConfigValue } from '@/lib/subconverter/types/configuration';
import { entry, objectValue, rejectImport, requiredText, section, text, texts } from '../../utils/parser';
import type { PolicyConfigNode } from '../model/types';

function readObject(value: ConfigValue, toml: boolean): PolicyConfigNode {
  const object = objectValue(value, 'policies');

  rejectImport(object);

  if (!toml) {
    const ignored = entry(object, 'use');

    if (ignored) {
      logger.warn('当前配置格式不支持策略供应者，已忽略', { field: 'use', data: ignored.values });
    }
  }

  for (const item of object.entries) {
    if (!['name', 'type', 'rule', 'use', 'url', 'interval', 'timeout', 'tolerance', 'import'].includes(item.key)) {
      logger.warn('不支持的配置参数，已忽略', { field: item.key, data: item.values });
    }
  }

  const node: PolicyConfigNode = {
    name: toml ? requiredText(object, 'name') : (text(object, 'name') ?? ''),
    type: toml ? requiredText(object, 'type') : (text(object, 'type') ?? ''),
    rule: texts(object, 'rule') ?? [],
    use: toml ? (texts(object, 'use') ?? []) : [],
  };

  for (const key of ['url', 'interval', 'timeout', 'tolerance'] as const) {
    const value = text(object, key);

    if (value !== undefined) {
      node[key] = value;
    }
  }

  return node;
}

export function readPolicyNodes(configuration: ConfigObject): { nodes: (string | PolicyConfigNode)[]; toml: boolean } {
  const root = entry(configuration, 'custom_groups');

  if (root) {
    return { nodes: root.values.map((value) => readObject(value, true)), toml: true };
  }

  const custom = section(configuration, 'custom');

  if (!custom) {
    return { nodes: [], toml: false };
  }

  const primary = entry(custom, 'proxy_groups');
  const entries = primary ? [primary] : custom.entries.filter((item) => item.key.startsWith('custom_proxy_group'));

  const nodes = entries.flatMap((item) =>
    item.values.map((value) => {
      if (typeof value === 'string') {
        rejectImport(value);

        return value;
      }

      return readObject(value, false);
    }),
  );

  return { nodes, toml: false };
}
