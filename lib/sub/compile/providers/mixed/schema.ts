import { base64 } from './shared';
import { computed, fallback, field, literal, object, text } from '../../shared';
import { realm } from '../../shared/node';
import type { NodeModule, NodeSchema, NodeSource } from '../../types';

// https://shadowsocks.org/doc/sip002.html
// https://github.com/XTLS/Xray-core/discussions/716
// https://github.com/2dust/v2rayN/wiki/Description-of-VMess-share-link
// https://v2.hysteria.network/docs/developers/URI-Scheme/
const base: NodeSchema = { scheme: 'protocol', server: 'server', port: 'port', name: 'name' };
const xray: NodeSchema = {
  encryption: computed((node) => node.encryption || 'none'),
  security: computed((node) => (node.realityPublicKey ? 'reality' : node.tls ? 'tls' : 'none')),
  flow: text('flow'),
  pbk: text('realityPublicKey'),
  sid: text('realityShortId'),
  fp: computed((node) => (node.realityPublicKey ? node.fingerprint || 'chrome' : node.fingerprint)),
  alpn: field('alpn', { transform: (_, node) => node.alpn?.join(',') }),
  sni: text('serverName'),
  type: computed((node) => (node.transport === 'h2' ? 'http' : (node.transport ?? 'tcp'))),
  headerType: field('headerType', { when: (_, node) => ['tcp', 'kcp'].includes(node.transport ?? 'tcp') }),
  host: field('host', {
    when: (_, node) =>
      ['ws', 'http', 'h2', 'httpupgrade', 'xhttp'].includes(node.transport ?? '') ||
      (node.transport === 'tcp' && node.headerType === 'http'),
  }),
  path: computed((node) =>
    ['ws', 'http', 'h2', 'httpupgrade', 'xhttp'].includes(node.transport ?? '') ||
    (node.transport === 'tcp' && node.headerType === 'http')
      ? node.path || '/'
      : undefined,
  ),
  seed: computed((node) => (node.transport === 'kcp' ? (node.xraySeed ?? node.path) : undefined)),
  serviceName: computed((node) => (node.transport === 'grpc' ? (node.serviceName ?? node.path) : undefined)),
  mode: field('mode', { when: (_, node) => ['grpc', 'xhttp'].includes(node.transport ?? '') }),
  authority: field('xrayAuthority', { when: (_, node) => node.transport === 'grpc' }),
  extra: field('xrayExtra', { when: (_, node) => node.transport === 'xhttp' }),
  fm: 'xrayFm',
  ech: 'ech',
  pcs: computed((node) => node.xrayPcs ?? node.certificatePin),
  vcn: 'xrayVcn',
  spx: text('xraySpx'),
};
const vmess: NodeSchema = {
  v: literal('2'),
  ps: 'name',
  add: 'server',
  port: field('port', { transform: String }),
  type: computed((node) => (['grpc', 'xhttp'].includes(node.transport ?? '') ? node.mode : node.headerType) || 'none'),
  id: fallback('uuid', ''),
  aid: field('alterId', { default: 0, transform: String }),
  scy: computed((node) => node.encryption || 'auto'),
  net: computed((node) => (node.transport === 'http' ? 'h2' : node.transport || 'tcp')),
  path: computed((node) =>
    node.transport === 'quic'
      ? (node.quicKey ?? '')
      : node.transport === 'grpc' && node.serviceName
        ? node.serviceName
        : (node.path ?? ''),
  ),
  host: computed((node) => (node.transport === 'quic' ? (node.quicSecurity ?? '') : (node.host ?? ''))),
  tls: computed((node) => (node.tls ? (node.realityPublicKey ? 'reality' : 'tls') : '')),
  sni: text('serverName'),
  alpn: field('alpn', { transform: (_, node) => node.alpn?.join(',') || undefined }),
  fp: text('fingerprint'),
  insecure: computed((node) => (node.allowInsecure ? '1' : '0')),
  pcs: computed((node) => node.xrayPcs ?? node.certificatePin),
  vcn: text('xrayVcn'),
};
const hysteria: NodeSchema = {
  insecure: computed((node) => (node.allowInsecure ? '1' : '0')),
  obfs: 'obfs',
  'obfs-password': 'obfsPassword',
  sni: 'serverName',
  pinSHA256: text('certificatePin'),
  ech: 'ech',
};

function vlessDefinition() {
  return {
    schema: { ...base, credential: 'uuid', query: object(xray) } satisfies NodeSchema,
    when: (node: Readonly<NodeSource>) =>
      !!node.uuid &&
      !node.allowInsecure &&
      ['tcp', 'kcp', 'ws', 'http', 'h2', 'grpc', 'httpupgrade', 'xhttp'].includes(node.transport ?? 'tcp'),
  };
}

function sip003(node: Readonly<NodeSource>): string | undefined {
  if (!node.plugin) {
    return;
  }

  const escape = (value: string) => value.replace(/[:;=\\]/g, '\\$&');

  return [
    escape(node.plugin),
    ...(node.pluginOptions ?? []).map((entry) => {
      const index = entry.indexOf('=');

      return index < 0 ? escape(entry) : `${escape(entry.slice(0, index))}=${escape(entry.slice(index + 1))}`;
    }),
  ].join(';');
}

export const schema: NodeModule['nodes'] = {
  ss: {
    schema: {
      ...base,
      credential: computed((node) =>
        node.encryption?.startsWith('2022-')
          ? `${encodeURIComponent(node.encryption)}:${encodeURIComponent(node.password ?? '')}`
          : base64(`${node.encryption ?? ''}:${node.password ?? ''}`, true),
      ),
      query: object({
        plugin: computed(sip003),
      }),
    },
  },
  // https://github.com/shadowsocksrr/shadowsocksr-csharp/blob/master/shadowsocks-csharp/Model/Server.cs
  ssr: {
    schema: {
      ...base,
      protocol: 'ssrProtocol',
      method: 'encryption',
      obfs: 'obfs',
      password: field('password', { default: '', transform: (value) => base64(String(value), true) }),
      query: object({
        uot: field('uot', { when: (value) => value === true, transform: () => '1' }),
        group: field('sourceGroup', { default: '', transform: (value) => base64(String(value), true) }),
        remarks: field('name', { transform: (value) => base64(String(value), true) }),
        obfsparam: field('obfsParam', { default: '', transform: (value) => base64(String(value), true) }),
        protoparam: field('ssrProtocolParam', { default: '', transform: (value) => base64(String(value), true) }),
      }),
    },
  },
  vmess: {
    schema: { ...base, payload: object(vmess) },
    when: (node) =>
      !node.realityPublicKey && ['tcp', 'kcp', 'ws', 'http', 'h2', 'quic', 'grpc'].includes(node.transport ?? 'tcp'),
  },
  vless: vlessDefinition(),
  // https://github.com/trojan-gfw/trojan-url#url-scheme
  trojan: {
    schema: { ...base, credential: 'password' },
    when: (node) =>
      !!node.password &&
      (node.transport ?? 'tcp') === 'tcp' &&
      node.tls !== false &&
      !node.realityPublicKey &&
      !node.allowInsecure &&
      !node.certificatePin &&
      !node.alpn?.length &&
      !node.ech &&
      (!node.serverName || node.serverName.toLowerCase() === node.server.toLowerCase()),
  },
  hysteria2: {
    when: (node) => !node.realmUrl || !!realm(node),
    schema: {
      ...base,
      credential: text('password'),
      realm: computed((node) => realm(node)?.uri),
      port: computed((node) => node.portRanges?.join(',') || node.port),
      query: object({ ...hysteria, auth: field('password', { when: (_, node) => !!node.realmUrl }) }),
    },
  },
};
