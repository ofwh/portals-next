import { json, nodeItems, optional, port, shape, stringOrNumber, text, union } from '../../schema';
import type { SSRConfig } from '../../types/ssr';

export const ssrProxyNode = shape({
  server: text,
  server_port: port,
  method: text,
  password: text,
  protocol: optional(text),
  protocolparam: optional(text),
  protocol_param: optional(text),
  obfs: optional(text),
  obfsparam: optional(text),
  obfs_param: optional(text),
  remarks: optional(text),
  group: optional(text),
  plugin: optional(text),
  plugin_opts: optional(text),
});

export const ssrConfig = union(shape({ configs: nodeItems(ssrProxyNode, 'ssr') }), (value: unknown) => {
  const config = shape({ local_address: text, local_port: stringOrNumber })(value);
  const nodes = nodeItems(ssrProxyNode, 'ssr')([value]);

  return nodes.length ? { ...nodes[0], ...config } : { ...config, configs: [] };
});

export function parse(content: string): SSRConfig {
  return ssrConfig(json(content));
}
