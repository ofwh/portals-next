import type { SSConfig } from '../../types/providers/ss';
import { nodeItems } from '../node-items';
import { json, optional, port, shape, text, union } from '../schema';

export const ssProxyNode = shape({
  server: text,
  server_port: port,
  method: text,
  password: text,
  remarks: optional(text),
  group: optional(text),
  plugin: optional(text),
  plugin_opts: optional(text),
});

export const ssConfig = union(
  // SS Android 导出的节点数组复用 SS 解析。
  nodeItems(ssProxyNode, 'ss'),
  union(
    shape({ servers: nodeItems(ssProxyNode, 'ss'), remarks: optional(text) }),
    shape({ configs: nodeItems(ssProxyNode, 'ss'), remarks: optional(text) }),
  ),
);

export function parse(content: string): SSConfig {
  return ssConfig(json(content));
}
