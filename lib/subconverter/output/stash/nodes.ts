import logger from '@/lib/api/logger';
import type { NativeObject, OutputElements } from '../../types/output';
import { transform as clashNodes } from '../clash/nodes';
import { fail, OUTPUT_ERROR } from '../shared/errors';

const common = ['type', 'name', 'id', 'sourceId', 'groupId', 'group', 'server', 'port', 'udp', 'tcpFastOpen'];
const tls = ['tls', 'serverName', 'allowInsecure', 'alpn'];
const transport = ['network', 'path', 'headers', 'grpcServiceName'];
const fields: Record<string, readonly string[]> = {
  ss: ['cipher', 'password', 'plugin', 'pluginMode', 'pluginHost', 'pluginPath', 'pluginTls', 'pluginSkipCertVerify'],
  ssr: ['cipher', 'password', 'protocol', 'protocolParam', 'obfs', 'obfsParam'],
  vmess: ['cipher', 'uuid', 'alterId', 'tls', ...tls, ...transport],
  vless: ['uuid', 'tls', 'flow', 'realityPublicKey', 'realityShortId', 'clientFingerprint', ...tls, ...transport],
  trojan: ['password', ...tls, ...transport],
  http: ['username', 'password'],
  https: ['username', 'password', ...tls],
  socks5: ['username', 'password'],
  snell: ['password', 'snellVersion', 'obfs', 'obfsHost'],
  hysteria2: ['password', 'upMbps', 'downMbps', 'obfs', 'obfsPassword', ...tls],
  tuic: ['uuid', 'password', 'token', ...tls],
  wireguard: ['privateKey', 'localAddresses', 'wireGuardPeers', 'mtu', 'dnsServers'],
};

export function transform(nodes: OutputElements['nodes']) {
  nodes.forEach((node, index) => {
    const allowed = fields[node.type];

    if (!allowed || Object.keys(node).some((key) => !common.includes(key) && !allowed.includes(key))) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_STASH_NODE_FIELD, { data: node, field: 'fields' });

      fail('node', index, 'fields', OUTPUT_ERROR.UNSUPPORTED_STASH_NODE_FIELD);
    }

    if (
      'network' in node &&
      node.network !== undefined &&
      !['tcp', 'ws', 'grpc', ...(node.type === 'vmess' || node.type === 'vless' ? ['http'] : [])].includes(node.network)
    ) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_STASH_TRANSPORT, { data: node, field: 'network' });

      fail('node', index, 'network', OUTPUT_ERROR.UNSUPPORTED_STASH_TRANSPORT);
    }

    if (
      node.type === 'ss' &&
      node.plugin &&
      !['obfs', 'obfs-local', 'simple-obfs', 'v2ray-plugin'].includes(node.plugin)
    ) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_STASH_PLUGIN, { data: node, field: 'plugin' });

      fail('node', index, 'plugin', OUTPUT_ERROR.UNSUPPORTED_STASH_PLUGIN);
    }

    if (
      node.type === 'snell' &&
      (node.snellVersion === undefined || node.snellVersion > 5 || (node.udp && node.snellVersion < 3))
    ) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_STASH_SNELL_VERSION, { data: node, field: 'version' });

      fail('node', index, 'version', OUTPUT_ERROR.UNSUPPORTED_STASH_SNELL_VERSION);
    }
  });
  const result = clashNodes(nodes);

  return {
    ...result,
    entries: result.entries.map((entry) => {
      const node = entry.fields;
      const value: NativeObject = { ...entry.value };

      if (node.type === 'hysteria2') {
        delete value.password;
        delete value.up;
        delete value.down;
        value.auth = node.password;
        if (node.upMbps !== undefined) {
          value['up-speed'] = node.upMbps;
        }

        if (node.downMbps !== undefined) {
          value['down-speed'] = node.downMbps;
        }
      }

      if (node.type === 'tuic') {
        value.version = node.token ? 4 : 5;
      }

      if (node.type === 'wireguard') {
        const peer = node.wireGuardPeers[0];
        const ipv4 = node.localAddresses.filter((address) => !address.includes(':'));
        const ipv6 = node.localAddresses.filter((address) => address.includes(':'));

        if (
          node.wireGuardPeers.length !== 1 ||
          ipv4.length !== 1 ||
          ipv6.length > 1 ||
          !peer.allowedIps ||
          new Set(peer.allowedIps).size !== 2 ||
          !peer.allowedIps.includes('0.0.0.0/0') ||
          !peer.allowedIps.includes('::/0')
        ) {
          logger.warn(OUTPUT_ERROR.UNSUPPORTED_STASH_WIREGUARD_LAYOUT, { data: node, field: 'wireGuardPeers' });

          return fail('node', entry.sourceIndex, 'wireGuardPeers', OUTPUT_ERROR.UNSUPPORTED_STASH_WIREGUARD_LAYOUT);
        }

        delete value.peers;
        value.server = peer.server;
        value.port = peer.port;
        value.ip = ipv4[0].split('/')[0];
        if (ipv6.length) {
          value.ipv6 = ipv6[0].split('/')[0];
        }

        value['public-key'] = peer.publicKey;
        if (peer.preSharedKey !== undefined) {
          value['preshared-key'] = peer.preSharedKey;
        }

        if (peer.reserved !== undefined) {
          value.reserved = peer.reserved;
        }

        if (peer.keepAlive !== undefined) {
          value.keepalive = peer.keepAlive;
        }
      }

      return { ...entry, value };
    }),
  };
}
