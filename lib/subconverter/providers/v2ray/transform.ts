import { v2rayNProxyNode, v2rayProxyNode } from './parser';
import { rejectNode } from '../../proxy-node/debug';
import { expand, flatten, get, nativeFingerprint, put, remove } from '../../proxy-node/mapping';
import { createTransform } from '../../proxy-node/transform';
import type { V2RayConfig, V2RayNode } from '../../types/providers/v2ray';
import type { Binding } from '../../types/proxy-node/mapping';

export const supports = ['ss', 'socks5', 'vmess'] as const;
const bindings = [
  {
    path: 'tag',
    field: 'name',
  },
  {
    path: 'settings.vnext.0.address',
    field: 'server',
  },
  {
    path: 'settings.vnext.0.port',
    field: 'port',
    codec: 'port',
  },
  {
    path: 'settings.vnext.0.users.0.id',
    field: 'uuid',
  },
  {
    path: 'settings.vnext.0.users.0.alterId',
    field: 'alterId',
  },
  {
    path: 'settings.vnext.0.users.0.security',
    field: 'cipher',
  },
  {
    path: 'streamSettings.network',
    field: 'network',
  },
  {
    path: 'streamSettings.security',
    field: 'tls',
    codec: 'tlsMode',
  },
  {
    path: 'streamSettings.tlsSettings.serverName',
    field: 'serverName',
  },
  {
    path: 'streamSettings.tlsSettings.allowInsecure',
    field: 'allowInsecure',
  },
  {
    path: 'streamSettings.tlsSettings.alpn',
    field: 'alpn',
  },
  {
    path: 'streamSettings.tlsSettings.fingerprint',
    field: 'clientFingerprint',
  },
  {
    path: 'streamSettings.wsSettings.path',
    field: 'path',
    network: 'ws',
  },
  {
    path: 'streamSettings.wsSettings.headers',
    field: 'headers',
    codec: 'headersList',
    network: 'ws',
  },
  {
    path: 'streamSettings.wsSettings.maxEarlyData',
    field: 'maxEarlyData',
    network: 'ws',
  },
  {
    path: 'streamSettings.wsSettings.earlyDataHeaderName',
    field: 'earlyDataHeaderName',
    network: 'ws',
  },
  {
    path: 'streamSettings.grpcSettings.serviceName',
    field: 'grpcServiceName',
    network: 'grpc',
  },
  {
    path: 'streamSettings.grpcSettings.multiMode',
    field: 'grpcMode',
    codec: 'grpcMode',
    network: 'grpc',
  },
  {
    path: 'streamSettings.httpSettings.host',
    field: 'headers',
    codec: 'hostHeaders',
    network: 'h2',
  },
  {
    path: 'streamSettings.httpSettings.path',
    field: 'path',
    network: 'h2',
  },
  {
    path: 'streamSettings.tcpSettings.header.type',
    field: 'headerType',
    network: 'tcp',
  },
  {
    path: 'streamSettings.tcpSettings.header.request.path',
    field: 'paths',
    network: 'tcp',
  },
  {
    path: 'streamSettings.tcpSettings.header.request.headers',
    field: 'headers',
    codec: 'headersList',
    network: 'tcp',
  },
  {
    path: 'streamSettings.tcpSettings.header.request.method',
    field: 'httpMethod',
    network: 'tcp',
  },
  { path: 'mux.enabled', field: 'xrayMuxEnabled' },
  { path: 'mux.concurrency', field: 'xrayMuxConcurrency' },
  { path: 'mux.xudpConcurrency', field: 'xrayMuxXudpConcurrency' },
  { path: 'mux.xudpProxyUdp443', field: 'xrayMuxXudpProxyUdp443' },
  { path: 'streamSettings.tcpSettings.header.request.version', field: 'httpVersion', network: 'tcp' },
  { path: 'streamSettings.tcpSettings.header.response.version', field: 'tcpResponseVersion', network: 'tcp' },
  { path: 'streamSettings.tcpSettings.header.response.status', field: 'tcpResponseStatus', network: 'tcp' },
  { path: 'streamSettings.tcpSettings.header.response.reason', field: 'tcpResponseReason', network: 'tcp' },
  {
    path: 'streamSettings.tcpSettings.header.response.headers',
    field: 'tcpResponseHeaders',
    codec: 'headersList',
    network: 'tcp',
  },
] as const satisfies readonly Binding[];
const clientBindings = [
  {
    path: 'remarks',
    field: 'name',
  },
  {
    path: 'address',
    field: 'server',
  },
  {
    path: 'port',
    field: 'port',
    codec: 'port',
  },
  {
    path: 'id',
    field: 'uuid',
  },
  {
    path: 'alterId',
    field: 'alterId',
    codec: 'number',
  },
  {
    path: 'security',
    field: 'cipher',
  },
  {
    path: 'network',
    field: 'network',
  },
  {
    path: 'headerType',
    field: 'headerType',
  },
  {
    path: 'requestHost',
    field: 'headers',
    codec: 'hostHeaderSingle',
  },
  {
    path: 'path',
    field: 'path',
  },
  {
    path: 'streamSecurity',
    field: 'tls',
    codec: 'tlsMode',
  },
  {
    path: 'sni',
    field: 'serverName',
  },
  {
    path: 'allowInsecure',
    field: 'allowInsecure',
  },
  {
    path: 'subid',
    field: 'groupId',
  },
] as const satisfies readonly Binding[];
const ssBindings = [
  {
    path: 'remarks',
    field: 'name',
  },
  {
    path: 'address',
    field: 'server',
  },
  {
    path: 'port',
    field: 'port',
    codec: 'port',
  },
  {
    path: 'id',
    field: 'password',
  },
  {
    path: 'security',
    field: 'cipher',
  },
  {
    path: 'allowInsecure',
    field: 'allowInsecure',
  },
  {
    path: 'subid',
    field: 'groupId',
  },
] as const satisfies readonly Binding[];
const socksBindings = [
  {
    path: 'remarks',
    field: 'name',
  },
  {
    path: 'address',
    field: 'server',
  },
  {
    path: 'port',
    field: 'port',
    codec: 'port',
  },
  {
    path: 'allowInsecure',
    field: 'allowInsecure',
  },
  {
    path: 'subid',
    field: 'groupId',
  },
] as const satisfies readonly Binding[];

export function readNode(value: unknown): V2RayNode {
  return get(value, 'protocol') === 'vmess' ? v2rayProxyNode(value) : v2rayNProxyNode(value);
}

export function extract(config: V2RayConfig): V2RayNode[] {
  if ('vmess' in config) {
    return config.vmess.filter((node) => [1, 3, 4].includes(node.configType));
  }

  const nodes: V2RayNode[] = [];

  for (const outbound of config.outbounds) {
    if (outbound.protocol !== 'vmess') {
      continue;
    }

    for (const server of outbound.settings.vnext) {
      for (const user of server.users) {
        nodes.push({ ...outbound, settings: { ...outbound.settings, vnext: [{ ...server, users: [user] }] } });
      }
    }
  }

  return nodes;
}

export const transform = createTransform({
  provider: 'v2ray',
  supports,
  readNode,
  toFields(node) {
    if ('configType' in node) {
      const source = { ...node };
      const type =
        node.configType === 1
          ? 'vmess'
          : node.configType === 3
            ? 'ss'
            : node.configType === 4
              ? 'socks5'
              : rejectNode('unsupported-protocol');

      if (type === 'socks5' && node.id) {
        return rejectNode('unrepresentable-socks-auth');
      }

      return flatten(type, source, type === 'vmess' ? clientBindings : type === 'ss' ? ssBindings : socksBindings, [
        'configType',
        ...(type === 'socks5' ? ['id'] : []),
      ]);
    }

    if (node.settings.vnext.length !== 1 || node.settings.vnext[0].users.length !== 1) {
      return rejectNode('ambiguous-vmess-endpoints');
    }

    const source = { ...node };
    const stream = node.streamSettings ?? node.streamsettings;

    if (stream) {
      const normalized = { ...stream };

      if (stream.tcpsettings) {
        put(normalized, 'tcpSettings', stream.tcpsettings);
        remove(normalized, 'tcpsettings');
      }

      if (stream.wssettings) {
        put(normalized, 'wsSettings', stream.wssettings);
        remove(normalized, 'wssettings');
      }

      put(source, 'streamSettings', normalized);
      remove(source, 'streamsettings');
      put(source, 'network', stream.network ?? 'tcp');
    }

    return flatten('vmess', source, bindings, ['protocol', 'network']);
  },
  toNode(fields): V2RayNode {
    if (fields.type === 'vmess' && fields.groupId !== undefined) {
      return v2rayNProxyNode(expand(fields, clientBindings, { configType: 1 }));
    }

    if (fields.type === 'vmess') {
      const fingerprint = nativeFingerprint(fields);
      const initial = { protocol: 'vmess' };

      if (fingerprint.value !== undefined) {
        put(initial, 'streamSettings.tlsSettings.fingerprint', fingerprint.value);
      }

      return v2rayProxyNode(expand(fields, bindings, initial, fingerprint.fixed));
    }

    return v2rayNProxyNode(
      expand(fields, fields.type === 'ss' ? ssBindings : socksBindings, {
        configType: fields.type === 'ss' ? 3 : 4,
        id: '',
      }),
    );
  },
});
