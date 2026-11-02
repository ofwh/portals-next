import {
  array,
  boolean,
  camelObject,
  entries,
  field,
  json,
  nodeItems,
  number,
  object,
  oneOf,
  optional,
  port,
  shape,
  text,
  union,
} from '../../schema';
import type { SingBoxConfig } from '../../types/sing-box';

const strings = array(text);

const tls = shape({
  enabled: optional(boolean),
  disable_sni: optional(boolean),
  server_name: optional(text),
  insecure: optional(boolean),
  alpn: optional(strings),
  min_version: optional(text),
  max_version: optional(text),
  certificate: optional(union(text, strings)),
  certificate_path: optional(text),
  utls: optional(shape({ enabled: optional(boolean), fingerprint: optional(text) })),
  reality: optional(shape({ enabled: optional(boolean), public_key: optional(text), short_id: optional(text) })),
  ech: optional(
    shape({
      enabled: optional(boolean),
      config: optional(union(text, strings)),
      config_path: optional(text),
      dynamic_record_sizing_disabled: optional(boolean),
      pq_signature_schemes_enabled: optional(boolean),
    }),
  ),
});

const transport = shape({
  type: oneOf('tcp', 'http', 'ws', 'quic', 'grpc', 'httpupgrade'),
  host: optional(union(text, strings)),
  path: optional(text),
  headers: optional(entries(union(text, strings))),
  service_name: optional(text),
  max_early_data: optional(number),
  early_data_header_name: optional(text),
});

const singBoxNode = shape({
  type: oneOf(
    'shadowsocks',
    'vmess',
    'vless',
    'trojan',
    'snell',
    'http',
    'socks',
    'wireguard',
    'hysteria',
    'hysteria2',
    'tuic',
    'anytls',
    'naive',
  ),
  tag: optional(text),
  server: optional(text),
  server_port: optional(port),
  username: optional(text),
  password: optional(text),
  method: optional(text),
  uuid: optional(text),
  alter_id: optional(number),
  security: optional(text),
  plugin: optional(text),
  plugin_opts: optional(text),
  version: optional(union(text, number)),
  psk: optional(text),
  userkey: optional(text),
  reuse: optional(boolean),
  mode: optional(text),
  obfs_mode: optional(text),
  obfs_host: optional(text),
  network: optional(union(text, strings)),
  tls: optional(tls),
  transport: optional(transport),
  multiplex: optional(
    shape({
      enabled: optional(boolean),
      protocol: optional(text),
      max_connections: optional(number),
      min_streams: optional(number),
      max_streams: optional(number),
      padding: optional(boolean),
      brutal: optional(shape({ enabled: optional(boolean), up_mbps: optional(number), down_mbps: optional(number) })),
    }),
  ),
  flow: optional(text),
  packet_encoding: optional(text),
  detour: optional(text),
  bind_interface: optional(text),
  routing_mark: optional(number),
  tcp_fast_open: optional(boolean),
  udp_over_tcp: optional(union(boolean, shape({ enabled: optional(boolean), version: optional(number) }))),
  private_key: optional(text),
  peer_public_key: optional(text),
  pre_shared_key: optional(text),
  local_address: optional(strings),
  reserved: optional(array(number)),
  mtu: optional(number),
  peers: optional(
    array(
      shape({
        server: text,
        server_port: port,
        public_key: text,
        pre_shared_key: optional(text),
        allowed_ips: optional(strings),
        reserved: optional(array(number)),
        persistent_keepalive_interval: optional(number),
      }),
    ),
  ),
  up_mbps: optional(number),
  down_mbps: optional(number),
  auth: optional(union(text, strings)),
  auth_str: optional(text),
  obfs: optional(union(text, shape({ type: text, password: text }))),
  server_ports: optional(strings),
  hop_interval: optional(text),
  congestion_control: optional(text),
  udp_relay_mode: optional(text),
  zero_rtt_handshake: optional(boolean),
  heartbeat: optional(text),
  idle_session_check_interval: optional(text),
  idle_session_timeout: optional(text),
  min_idle_session: optional(number),
  insecure_concurrency: optional(number),
  quic: optional(boolean),
});

export function singBoxProxyNode(value: unknown) {
  const node = singBoxNode(value);

  if (node.type === 'wireguard') {
    return node;
  }

  return { ...node, server: text(node.server), serverPort: port(node.serverPort) };
}

export const singBoxWireGuardEndpoint = shape({
  type: oneOf('wireguard'),
  tag: optional(text),
  system: optional(boolean),
  name: optional(text),
  mtu: optional(number),
  address: array(text),
  private_key: text,
  listen_port: optional(number),
  workers: optional(number),
  peers: array(
    shape({
      address: text,
      port,
      public_key: text,
      pre_shared_key: optional(text),
      allowed_ips: optional(strings),
      persistent_keepalive_interval: optional(number),
      reserved: optional(array(number)),
    }),
  ),
});

export const singBoxAction = shape({
  type: oneOf('direct', 'block', 'dns', 'selector', 'urltest'),
  tag: optional(text),
  outbounds: optional(strings),
  default: optional(text),
  url: optional(text),
  interval: optional(text),
  tolerance: optional(number),
  interrupt_exist_connections: optional(boolean),
});

export function parse(content: string): SingBoxConfig {
  const config = object(json(content));

  if (!('outbounds' in config) && !('endpoints' in config)) {
    throw new Error('sing-box configuration requires outbounds or endpoints');
  }

  const result: SingBoxConfig = { ...camelObject(config) };

  if ('outbounds' in config) {
    result.outbounds = nodeItems(union(singBoxProxyNode, singBoxAction), 'sing-box')(field(config, 'outbounds'));
  }

  if ('endpoints' in config) {
    result.endpoints = nodeItems(singBoxWireGuardEndpoint, 'sing-box')(field(config, 'endpoints'));
  }

  return result;
}
