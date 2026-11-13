import { Buffer } from 'node:buffer';
import { computed, field, literal, pluginOptions, text } from '../../shared';
import { base, plainXray } from '../../shared/ini';
import type { NodeDefinition, NodeModule, NodeSchema, NodeSource } from '../../types';

// https://github.com/crossutility/Quantumult-X/blob/master/sample.conf
function activeTls(node: Readonly<NodeSource>): boolean {
  return !!(
    (node.tls ?? ['anytls', 'https'].includes(node.protocol)) ||
    node.realityPublicKey ||
    (node.protocol === 'ss' && node.plugin === 'v2ray-plugin' && Object.hasOwn(pluginOptions(node), 'tls'))
  );
}

function verification(node: Readonly<NodeSource>): boolean {
  return node.protocol !== 'ssr' && !node.realityPublicKey && activeTls(node);
}

const relay: NodeSchema = {
  'fast-open': computed((node) => (node.realityPublicKey ? false : node.tcpFastOpen)),
  'udp-relay': 'udp',
  'tls-verification': field('allowInsecure', { when: (_, node) => verification(node), transform: (value) => !value }),
  'tls-cert-sha256': field('certificatePin', { when: (_, node) => verification(node) && node.allowInsecure !== true }),
  server_check_url: text('testUrl'),
  'reality-base64-pubkey': text('realityPublicKey'),
  'reality-hex-shortid': field('realityShortId', { when: (_, node) => !!node.realityPublicKey }),
};
const xray: NodeSchema = {
  password: computed((node) => (['vmess', 'vless'].includes(node.protocol) ? node.uuid : node.password)),
  method: computed((node) =>
    node.protocol === 'vless'
      ? 'none'
      : node.protocol === 'vmess'
        ? node.encryption === 'auto'
          ? 'chacha20-poly1305'
          : node.encryption
        : undefined,
  ),
  aead: field('alterId', { when: (value, node) => node.protocol === 'vmess' && !!value, transform: () => false }),
  obfs: computed((node) =>
    node.transport === 'ws'
      ? activeTls(node)
        ? 'wss'
        : 'ws'
      : ['vmess', 'vless'].includes(node.protocol)
        ? node.headerType === 'http'
          ? 'http'
          : activeTls(node)
            ? 'over-tls'
            : undefined
        : undefined,
  ),
  'obfs-host': computed((node) =>
    node.transport === 'ws'
      ? activeTls(node)
        ? node.host || node.server
        : node.host || undefined
      : ['vmess', 'vless'].includes(node.protocol)
        ? node.headerType === 'http'
          ? node.host || undefined
          : activeTls(node)
            ? node.serverName || undefined
            : undefined
        : undefined,
  ),
  'obfs-uri': field('path', {
    when: (value, node) =>
      !!value &&
      (node.transport === 'ws' || (['vmess', 'vless'].includes(node.protocol) && node.headerType === 'http')),
  }),
  'over-tls': computed((node) =>
    !['vmess', 'vless'].includes(node.protocol) && node.transport !== 'ws' ? true : undefined,
  ),
  'tls-host': field('serverName', {
    when: (value, node) => !!value && !['vmess', 'vless'].includes(node.protocol) && node.transport !== 'ws',
  }),
  'reality-base64-pubkey': text('realityPublicKey'),
  'reality-hex-shortid': field('realityShortId', { when: (value, node) => !!value && !!node.realityPublicKey }),
  'vless-flow': text('flow'),
  'tls-alpn': field('alpn', {
    when: (_, node) => !node.realityPublicKey && !!node.alpn?.length,
    transform: (_, node) =>
      node.alpn
        ?.map((value) => Buffer.from([Buffer.byteLength(value)]).toString('hex') + Buffer.from(value).toString('hex'))
        .join(''),
  }),
};

function supportedXray(node: Readonly<NodeSource>): boolean {
  const transport = node.transport ?? 'tcp';
  const reality = !!node.realityPublicKey;

  return (
    plainXray({ ...node, tls13: undefined, xudp: undefined, headerType: undefined }) &&
    !node.underlyingProxy &&
    !node.serviceName &&
    !node.mode &&
    (!node.headerType || ['none', 'http'].includes(node.headerType)) &&
    ['tcp', 'ws'].includes(transport) &&
    (!node.packetEncoding || node.packetEncoding === 'none') &&
    (node.protocol !== 'vless' || !node.encryption || node.encryption === 'none') &&
    (!node.flow || (node.protocol === 'vless' && node.flow === 'xtls-rprx-vision' && reality && transport === 'tcp')) &&
    (node.protocol !== 'trojan' || !!node.tls || reality) &&
    (node.protocol !== 'anytls' || (transport === 'tcp' && !node.path)) &&
    !(
      transport === 'ws' &&
      activeTls(node) &&
      (node.host || node.server).toLowerCase() !== (node.serverName || node.server).toLowerCase()
    ) &&
    !(
      transport === 'tcp' &&
      node.headerType === 'http' &&
      ['vmess', 'vless'].includes(node.protocol) &&
      activeTls(node)
    ) &&
    (reality
      ? !!node.serverName &&
        /^[A-Za-z0-9_-]{43}$/.test(node.realityPublicKey ?? '') &&
        (!node.realityShortId || /^(?:[a-f0-9]{2}){1,8}$/i.test(node.realityShortId))
      : (activeTls(node) || !node.alpn?.length) &&
        !node.alpn?.some((value) => !value || Buffer.byteLength(value) > 255))
  );
}

function definition(fields: NodeSchema, when?: NodeDefinition['when']): NodeDefinition {
  return {
    schema: { ...base, ...fields, ...relay },
    when,
  };
}

export const schema: NodeModule['nodes'] = {
  ss: definition(
    {
      type: literal('shadowsocks'),
      method: 'encryption',
      password: 'password',
      'udp-over-tcp': 'uot',
      obfs: computed((node) => {
        const options = pluginOptions(node);

        return node.plugin === 'v2ray-plugin'
          ? (options.mode || 'websocket') === 'websocket'
            ? Object.hasOwn(options, 'tls')
              ? 'wss'
              : 'ws'
            : undefined
          : (options.obfs ?? (activeTls(node) ? 'over-tls' : undefined));
      }),
      'obfs-host': computed((node) => {
        const options = pluginOptions(node);

        return node.plugin === 'v2ray-plugin'
          ? options.host || undefined
          : (options['obfs-host'] ?? (activeTls(node) ? node.serverName : undefined));
      }),
      'obfs-uri': computed((node) =>
        node.plugin === 'v2ray-plugin' ? pluginOptions(node).path || undefined : undefined,
      ),
    },
    (node) => {
      const options = pluginOptions(node);

      return (
        !node.plugin ||
        (node.plugin === 'v2ray-plugin'
          ? (options.mode || 'websocket') === 'websocket' &&
            (options.mux === undefined || ['0', 'false'].includes(options.mux))
          : ['simple-obfs', 'obfs-local'].includes(node.plugin) && ['http', 'tls'].includes(options.obfs))
      );
    },
  ),
  ssr: definition({
    type: literal('shadowsocks'),
    method: 'encryption',
    password: 'password',
    'ssr-protocol': 'ssrProtocol',
    'ssr-protocol-param': text('ssrProtocolParam'),
    obfs: 'obfs',
    'obfs-host': text('obfsParam'),
  }),
  vmess: definition(xray, supportedXray),
  vless: definition(xray, supportedXray),
  trojan: definition(xray, supportedXray),
  anytls: definition(xray, supportedXray),
  http: definition({
    username: text('username'),
    password: text('password'),
    'over-tls': computed(activeTls),
    'tls-host': field('serverName', { when: (_, node) => activeTls(node) }),
  }),
  https: definition({
    type: literal('http'),
    username: text('username'),
    password: text('password'),
    'over-tls': computed(activeTls),
    'tls-host': field('serverName', { when: (_, node) => activeTls(node) }),
  }),
  socks5: definition({
    username: text('username'),
    password: text('password'),
    'over-tls': computed(activeTls),
    'tls-host': field('serverName', { when: (_, node) => activeTls(node) }),
  }),
};
