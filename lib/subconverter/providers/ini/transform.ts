import { splitFields } from './parser';
import { debugNode, rejectNode } from '../../proxy-node/debug';
import {
  assertCovered,
  convert,
  expand,
  flatten,
  get,
  nativeFingerprint,
  put,
  remove,
  validateFields,
} from '../../proxy-node/mapping';
import { createTransform, supportsType } from '../../proxy-node/transform';
import type { IniConfig, IniNode, IniWireGuardSettings } from '../../types/providers/ini';
import type { ProxyType } from '../../types/proxy-node/common';
import type { ProxyNodeFields } from '../../types/proxy-node/fields';
import type { Binding } from '../../types/proxy-node/mapping';
import { array, camelCase, number, object, oneOf, optional, shape, text } from '../schema';

export const supports = [
  'ss',
  'ssr',
  'vmess',
  'vless',
  'trojan',
  'snell',
  'http',
  'https',
  'socks5',
  'wireguard',
  'hysteria2',
  'tuic',
  'anytls',
] as const;
export type IniStyle = 'surge' | 'loon' | 'quanx';

const aliases = oneOf(
  'ss',
  'shadowsocks',
  'ssr',
  'shadowsocksr',
  'vmess',
  'vless',
  'trojan',
  'snell',
  'http',
  'https',
  'socks',
  'socks5',
  'socks5-tls',
  'wireguard',
  'hysteria2',
  'tuic',
  'anytls',
);
const common: readonly Binding[] = [
  { path: 'name', field: 'name' },
  { path: 'server', field: 'server' },
  { path: 'port', field: 'port', codec: 'port' },
  { path: 'options.sni', field: 'serverName' },
  { path: 'options.tlsName', field: 'serverName' },
  { path: 'options.tlsHost', field: 'serverName' },
  { path: 'options.skipCertVerify', field: 'allowInsecure', codec: 'booleanText' },
  { path: 'options.tfo', field: 'tcpFastOpen', codec: 'booleanText' },
  { path: 'options.fastOpen', field: 'tcpFastOpen', codec: 'booleanText' },
  { path: 'options.udpRelay', field: 'udp', codec: 'booleanText' },
  { path: 'options.udp', field: 'udp', codec: 'booleanText' },
  { path: 'options.tls', field: 'tls', codec: 'booleanText' },
  { path: 'options.overTls', field: 'tls', codec: 'booleanText' },
  { path: 'options.tls13', field: 'tls13', codec: 'booleanText' },
  { path: 'options.alpn', field: 'alpn', codec: 'comma' },
  { path: 'options.tlsProfile', field: 'clientFingerprint' },
  { path: 'options.fp', field: 'clientFingerprint' },
  { path: 'options.fingerprint', field: 'clientFingerprint' },
];
const transport: readonly Binding[] = [
  { path: 'network', field: 'network' },
  { path: 'options.transport', field: 'network' },
  { path: 'options.path', field: 'path' },
  { path: 'options.wsPath', field: 'path' },
  { path: 'options.obfsUri', field: 'path' },
  { path: 'options.wsHeaders', field: 'headers', codec: 'iniHeaders' },
  { path: 'options.host', field: 'headers', codec: 'hostHeaderSingle' },
  { path: 'options.obfsHost', field: 'headers', codec: 'hostHeaderSingle' },
  { path: 'options.flow', field: 'flow' },
  { path: 'options.vlessFlow', field: 'flow' },
  { path: 'options.publicKey', field: 'realityPublicKey' },
  { path: 'options.realityBase64Pubkey', field: 'realityPublicKey' },
  { path: 'options.shortId', field: 'realityShortId' },
  { path: 'options.realityHexShortid', field: 'realityShortId' },
];

export function endpoint(value: string): { server: string; port: number } {
  const match = /^(\[[^\]]+\]|[^:]+):(\d+)$/.exec(value);

  if (!match) {
    return rejectNode('invalid-endpoint');
  }

  return { server: match[1].replace(/^\[|\]$/g, ''), port: Number(convert(match[2], 'port')) };
}

function scalar(value: string): string {
  return value.length > 1 &&
    ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
    ? value.slice(1, -1)
    : value;
}

function peers(value: string): IniWireGuardSettings['peers'] {
  const matches = [...value.matchAll(/[({]([^(){}]*)[)}]/g)];

  if (!matches.length) {
    return rejectNode('invalid-wireguard-peers');
  }

  return matches.map((match) => {
    const options = {};

    for (const part of splitFields(match[1])) {
      const equal = part.indexOf('=');

      if (equal < 1) {
        return rejectNode('invalid-wireguard-peer');
      }

      put(options, camelCase(part.slice(0, equal).trim()), scalar(part.slice(equal + 1).trim()));
    }

    assertCovered(options, [
      'publicKey',
      'preSharedKey',
      'presharedKey',
      'allowedIps',
      'endpoint',
      'keepalive',
      'persistentKeepalive',
      'reserved',
      'clientId',
    ]);
    const address = endpoint(text(get(options, 'endpoint')));
    const reserved = get(options, 'reserved') ?? get(options, 'clientId');
    const allowedIps = get(options, 'allowedIps');
    const keepAlive = get(options, 'keepalive') ?? get(options, 'persistentKeepalive');
    const preSharedKey = get(options, 'preSharedKey') ?? get(options, 'presharedKey');

    return {
      ...address,
      publicKey: text(get(options, 'publicKey')),
      ...(preSharedKey !== undefined ? { preSharedKey: text(preSharedKey) } : {}),
      ...(allowedIps !== undefined
        ? {
            allowedIps: text(allowedIps)
              .split(',')
              .map((part) => part.trim()),
          }
        : {}),
      ...(keepAlive !== undefined ? { keepAlive: Number(convert(keepAlive, 'number')) } : {}),
      ...(reserved !== undefined
        ? {
            reserved: text(reserved)
              .replace(/[\[\]]/g, '')
              .split(/[,/]/)
              .map((part) => Number(convert(part.trim(), 'number'))),
          }
        : {}),
    };
  });
}

function wireGuard(node: IniNode): IniWireGuardSettings {
  if (node.wireGuard) {
    return node.wireGuard;
  }

  const options = node.options;
  const addresses = [
    options.selfIp ?? options.interfaceIp,
    options.selfIpv6 ?? options.selfIpV6 ?? options.interfaceIpv6 ?? options.interfaceIpV6,
  ].filter((value): value is string => value !== undefined);
  const peerText = options.peer ?? options.peers;

  if (!peerText) {
    return rejectNode('missing-wireguard-peers');
  }

  return {
    privateKey: text(options.privateKey),
    addresses: addresses.map((address) =>
      address.includes('/') ? address : `${address}/${address.includes(':') ? 128 : 32}`,
    ),
    peers: peers(peerText),
    ...(options.mtu !== undefined ? { mtu: Number(convert(options.mtu, 'number')) } : {}),
    ...((options.dns ?? options.dnsServer) !== undefined
      ? {
          dnsServers: text(options.dns ?? options.dnsServer)
            .split(',')
            .map((part) => part.trim()),
        }
      : {}),
  };
}

export function readNode(value: unknown): IniNode {
  const source = object(value);
  const type = aliases(get(source, 'type'));
  const result = {
    name: text(get(source, 'name')),
    type,
    arguments: array(text)(get(source, 'arguments')),
    options: object(get(source, 'options')),
    ...(get(source, 'raw') !== undefined ? { raw: text(get(source, 'raw')) } : {}),
    ...(get(source, 'layout') !== undefined
      ? { layout: oneOf('named', 'positional', 'endpoint')(get(source, 'layout')) }
      : {}),
  };

  for (const item of Object.values(result.options)) {
    text(item);
  }

  assertCovered(source, ['name', 'type', 'arguments', 'options', 'raw', 'layout', 'wireGuard']);

  return {
    ...result,
    ...(get(source, 'wireGuard') !== undefined ? { wireGuard: wireGuardSettings(get(source, 'wireGuard')) } : {}),
  };
}

const wireGuardSettings = shape({
  privateKey: text,
  addresses: array(text),
  peers: array(
    shape({
      server: text,
      port: number,
      publicKey: text,
      preSharedKey: optional(text),
      allowedIps: optional(array(text)),
      reserved: optional(array(number)),
      keepAlive: optional(number),
    }),
  ),
  mtu: optional(number),
  dnsServers: optional(array(text)),
  keepAlive: optional(number),
});

export function extract(config: IniConfig): IniNode[] {
  const result: IniNode[] = [];

  for (const [index, declaration] of config.proxies.entries()) {
    if (['direct', 'reject', 'reject-tinygif', 'dns'].includes(declaration.type)) {
      continue;
    }

    try {
      let node = declaration;

      if (declaration.type === 'wireguard' && declaration.options.sectionName) {
        const section = config.sections.find((item) => item.name === declaration.options.sectionName);

        if (!section) {
          rejectNode('missing-wireguard-section');
        }

        const options = { ...declaration.options };

        for (const line of section.lines) {
          const equal = line.indexOf('=');

          if (equal < 1) {
            rejectNode('invalid-wireguard-section');
          }

          put(options, camelCase(line.slice(0, equal).trim()), scalar(line.slice(equal + 1).trim()));
        }

        remove(options, 'sectionName');
        node = { ...declaration, options };
      }

      result.push(readNode(node));
    } catch {
      debugNode('ini', 'parse', index, 'invalid-or-unsupported-node');
    }
  }

  return result;
}

export function canonicalType(node: IniNode): (typeof supports)[number] {
  let type: string =
    node.type === 'ss' || node.type === 'shadowsocks'
      ? node.options.ssrProtocol
        ? 'ssr'
        : 'ss'
      : node.type === 'shadowsocksr'
        ? 'ssr'
        : node.type === 'socks' || node.type === 'socks5-tls'
          ? 'socks5'
          : node.type;

  if (type === 'http' && (node.options.tls === 'true' || node.options.overTls === 'true')) {
    type = 'https';
  }

  return supportsType(type, supports);
}

function protocolBindings(type: ProxyType): Binding[] {
  const result: Binding[] = [...common];

  if (['vmess', 'vless', 'trojan'].includes(type)) {
    result.push(...transport);
  }

  if (['ss', 'ssr', 'vmess'].includes(type)) {
    result.push({ path: 'options.encryptMethod', field: 'cipher' }, { path: 'options.method', field: 'cipher' });
  }

  if (['vmess', 'vless'].includes(type)) {
    result.push(
      { path: 'options.uuid', field: 'uuid' },
      { path: 'options.alterid', field: 'alterId', codec: 'numberText' },
    );
  }

  if (['ss', 'ssr', 'trojan', 'snell', 'anytls', 'hysteria2', 'tuic', 'http', 'https', 'socks5'].includes(type)) {
    result.push({ path: 'options.password', field: 'password' }, { path: 'options.psk', field: 'password' });
  }

  if (['http', 'https', 'socks5'].includes(type)) {
    result.push({ path: 'options.username', field: 'username' });
  }

  if (type === 'ss') {
    result.push(
      { path: 'plugin', field: 'plugin' },
      { path: 'options.obfs', field: 'pluginMode' },
      { path: 'options.obfsHost', field: 'pluginHost' },
    );
  }

  if (type === 'ssr') {
    result.push(
      { path: 'options.protocol', field: 'protocol' },
      { path: 'options.ssrProtocol', field: 'protocol' },
      { path: 'options.protocolParam', field: 'protocolParam' },
      { path: 'options.ssrProtocolParam', field: 'protocolParam' },
      { path: 'options.obfs', field: 'obfs' },
      { path: 'options.obfsParam', field: 'obfsParam' },
      { path: 'options.obfsHost', field: 'obfsParam' },
    );
  }

  if (type === 'snell') {
    result.push(
      { path: 'options.version', field: 'snellVersion', codec: 'numberText' },
      { path: 'options.reuse', field: 'snellReuse', codec: 'booleanText' },
      { path: 'options.obfs', field: 'obfs' },
      { path: 'options.obfsHost', field: 'obfsHost' },
      { path: 'options.mode', field: 'snellMode' },
      { path: 'options.udpPort', field: 'snellUdpPort', codec: 'numberText' },
      { path: 'options.shadowTlsPassword', field: 'shadowTlsPassword' },
      { path: 'options.shadowTlsSni', field: 'shadowTlsSni' },
      { path: 'options.shadowTlsVersion', field: 'shadowTlsVersion', codec: 'numberText' },
    );
  }

  if (type === 'hysteria2') {
    result.push(
      { path: 'options.downloadBandwidth', field: 'downMbps', codec: 'numberText' },
      { path: 'options.salamanderPassword', field: 'obfsPassword' },
    );
  }

  if (type === 'tuic') {
    result.push(
      { path: 'options.uuid', field: 'uuid' },
      { path: 'options.congestionController', field: 'congestionControl' },
      { path: 'options.udpRelayMode', field: 'udpRelayMode' },
    );
  }

  return result;
}

export function toFields(node: IniNode): ProxyNodeFields {
  const type = canonicalType(node);

  if (type === 'wireguard') {
    const settings = wireGuard(node);

    if (!node.wireGuard) {
      assertCovered(node.options, [
        'privateKey',
        'selfIp',
        'selfIpv6',
        'selfIpV6',
        'interfaceIp',
        'interfaceIpv6',
        'interfaceIpV6',
        'peer',
        'peers',
        'mtu',
        'dns',
        'dnsServer',
      ]);
    }

    return validateFields({
      type,
      name: node.name,
      privateKey: settings.privateKey,
      localAddresses: settings.addresses,
      wireGuardPeers: settings.peers,
      mtu: settings.mtu,
      dnsServers: settings.dnsServers,
      keepAlive: settings.keepAlive,
    });
  }

  const options = { ...node.options };
  const args = [...node.arguments];
  const address =
    node.layout === 'endpoint'
      ? endpoint(text(args.shift()))
      : { server: text(args.shift()), port: Number(convert(args.shift(), 'port')) };
  const source = { name: node.name, ...address, options };

  if (type === 'anytls' && get(options, 'blockQuic') !== undefined) {
    if (get(options, 'blockQuic') !== 'false') {
      return rejectNode('unrepresentable-quic-policy');
    }

    remove(options, 'blockQuic');
  }

  if (args.length) {
    if (['ss', 'ssr', 'vmess'].includes(type)) {
      if (args.length < 2) {
        return rejectNode('missing-positional-credentials');
      }

      put(options, 'encryptMethod', args.shift());
      put(options, type === 'vmess' ? 'uuid' : 'password', args.shift());
    } else if (type === 'vless') {
      put(options, 'uuid', args.shift());
    } else if (['http', 'https', 'socks5'].includes(type)) {
      put(options, 'username', args.shift());
      put(options, 'password', args.shift());
    } else {
      put(options, 'password', args.shift());
    }

    if (type === 'ss' && args.length <= 2) {
      if (args.length) {
        put(options, 'obfs', args.shift());
      }

      if (args.length) {
        put(options, 'obfsHost', args.shift());
      }
    }

    if (args.length) {
      return rejectNode('unrepresentable-positional-parameters');
    }
  }

  if (['vmess', 'vless'].includes(type)) {
    const uuid = node.layout === 'endpoint' ? get(options, 'password') : get(options, 'username');

    if (uuid !== undefined) {
      put(options, 'uuid', uuid);
      remove(options, node.layout === 'endpoint' ? 'password' : 'username');
    }
  }

  if (node.layout === 'endpoint' && type === 'vless' && get(options, 'method') === 'none') {
    remove(options, 'method');
  }

  for (const key of ['aead', 'vmessAead']) {
    const aead = get(options, key);

    if (aead !== undefined) {
      put(options, 'alterid', convert(aead, 'boolean') ? '0' : '1');
      remove(options, key);
    }
  }
  if (get(options, 'tlsVerification') !== undefined) {
    put(options, 'skipCertVerify', String(!convert(get(options, 'tlsVerification'), 'boolean')));
    remove(options, 'tlsVerification');
  }

  if (get(options, 'tag') !== undefined) {
    remove(options, 'tag');
  }

  for (const key of ['username', 'password']) {
    if (['http', 'https', 'socks5'].includes(type) && ['', 'none'].includes(String(get(options, key)))) {
      remove(options, key);
    }
  }
  if (type === 'ss' && get(options, 'obfs') !== undefined) {
    if (!['http', 'tls'].includes(text(get(options, 'obfs')))) {
      return rejectNode('unsupported-ss-plugin');
    }

    put(source, 'plugin', 'obfs-local');
  }

  if (['vmess', 'vless', 'trojan'].includes(type)) {
    const obfs = get(options, 'obfs');

    if (obfs !== undefined) {
      if (!['ws', 'wss', 'over-tls', 'http', 'none'].includes(text(obfs))) {
        return rejectNode('unsupported-transport');
      }

      put(source, 'network', obfs === 'ws' || obfs === 'wss' ? 'ws' : 'tcp');
      put(options, 'tls', String(obfs === 'wss' || obfs === 'over-tls'));
      remove(options, 'obfs');
    }

    if (get(options, 'ws') !== undefined) {
      put(source, 'network', convert(get(options, 'ws'), 'boolean') ? 'ws' : 'tcp');
      remove(options, 'ws');
    }
  }

  const defaults = ['trojan', 'anytls', 'hysteria2', 'tuic', 'https'].includes(type) ? { tls: true } : {};
  const fields = flatten(type, source, protocolBindings(type), [], defaults);

  return fields;
}

export function toNode(fields: ProxyNodeFields, style: IniStyle): IniNode {
  if (fields.type === 'wireguard') {
    assertCovered(fields, [
      'type',
      'name',
      'privateKey',
      'localAddresses',
      'wireGuardPeers',
      'mtu',
      'dnsServers',
      'keepAlive',
    ]);

    return {
      type: 'wireguard',
      name: fields.name,
      arguments: [],
      options: {},
      wireGuard: {
        privateKey: fields.privateKey,
        addresses: fields.localAddresses,
        peers: fields.wireGuardPeers,
        mtu: fields.mtu,
        dnsServers: fields.dnsServers,
        keepAlive: fields.keepAlive,
      },
    };
  }

  if (
    'network' in fields &&
    fields.network !== undefined &&
    !['tcp', 'ws', ...(style === 'loon' ? ['http'] : [])].includes(fields.network)
  ) {
    return rejectNode('unsupported-transport');
  }

  const bindings = protocolBindings(fields.type).filter((binding) => binding.path !== 'network');
  const fixed = ['trojan', 'anytls', 'hysteria2', 'tuic', 'https'].includes(fields.type) ? { tls: true } : {};
  const fingerprint = nativeFingerprint(fields);

  for (const [key, value] of Object.entries(fingerprint.fixed)) {
    put(fixed, key, value);
  }
  const initial = {};

  if (fingerprint.value !== undefined) {
    put(initial, 'options.tlsProfile', fingerprint.value);
  }

  const output = expand(fields, bindings, initial, fixed);
  const options = { ...object(get(output, 'options') ?? {}) };
  const address = { server: text(get(output, 'server')), port: Number(convert(get(output, 'port'), 'port')) };
  const args = [address.server, String(address.port)];
  const type = fields.type;
  let nativeType = aliases(type === 'socks5' ? 'socks5' : type === 'ssr' ? 'shadowsocksr' : type);

  if (get(output, 'plugin') !== undefined) {
    if (!['obfs-local', 'simple-obfs'].includes(text(get(output, 'plugin')))) {
      return rejectNode('unsupported-ss-plugin');
    }
  }

  if (['vmess', 'vless'].includes(type)) {
    put(options, style === 'quanx' ? 'password' : 'username', get(options, 'uuid'));
    remove(options, 'uuid');
  }

  const network = get(options, 'transport');

  if (style === 'surge' && network !== undefined) {
    if (!['tcp', 'ws'].includes(text(network))) {
      return rejectNode('unsupported-transport');
    }

    put(options, 'ws', String(network === 'ws'));
    if (get(options, 'path') !== undefined) {
      put(options, 'wsPath', get(options, 'path'));
      remove(options, 'path');
    }

    if (get(options, 'host') !== undefined) {
      put(options, 'wsHeaders', `Host:${text(get(options, 'host'))}`);
      remove(options, 'host');
    }

    remove(options, 'transport');
  }

  if (style === 'quanx' && network !== undefined) {
    if (!['tcp', 'ws'].includes(text(network))) {
      return rejectNode('unsupported-transport');
    }

    const tls = get(fields, 'tls') === true;

    put(options, 'obfs', network === 'ws' ? (tls ? 'wss' : 'ws') : tls ? 'over-tls' : 'none');
    if (get(options, 'path') !== undefined) {
      put(options, 'obfsUri', get(options, 'path'));
      remove(options, 'path');
    }

    if (get(options, 'host') !== undefined) {
      put(options, 'obfsHost', get(options, 'host'));
      remove(options, 'host');
    }

    remove(options, 'transport');
  }

  if (type === 'https' && style !== 'loon') {
    nativeType = 'http';
    put(options, style === 'quanx' ? 'overTls' : 'tls', 'true');
  }

  if (style === 'loon') {
    if (['ss', 'ssr', 'vmess'].includes(type)) {
      args.push(
        text(get(options, 'encryptMethod') ?? (type === 'vmess' ? 'auto' : undefined)),
        text(get(options, type === 'vmess' ? 'username' : 'password')),
      );
      remove(options, 'encryptMethod', type === 'vmess' ? 'username' : 'password');
    } else if (type === 'vless') {
      args.push(text(get(options, 'username')));
      remove(options, 'username');
    } else if (['http', 'https', 'socks5'].includes(type)) {
      if (get(options, 'username') !== undefined || get(options, 'password') !== undefined) {
        args.push(text(get(options, 'username') ?? ''), text(get(options, 'password') ?? ''));
        remove(options, 'username', 'password');
      }
    } else {
      args.push(text(get(options, 'password')));
      remove(options, 'password');
    }

    if (type === 'ss') {
      nativeType = 'shadowsocks';
    }

    if (get(options, 'tls') !== undefined) {
      put(options, 'overTls', get(options, 'tls'));
      remove(options, 'tls');
    }
  } else if (style === 'quanx') {
    args.splice(
      0,
      args.length,
      `${address.server.includes(':') ? `[${address.server}]` : address.server}:${address.port}`,
    );
    put(options, 'tag', fields.name);
    if (type === 'ss' || type === 'ssr') {
      nativeType = 'shadowsocks';
    }

    if (get(options, 'encryptMethod') !== undefined) {
      put(options, 'method', get(options, 'encryptMethod'));
      remove(options, 'encryptMethod');
    }

    if (type === 'vless') {
      put(options, 'method', 'none');
    }

    if (get(options, 'tls') !== undefined) {
      put(options, 'overTls', get(options, 'tls'));
      remove(options, 'tls');
    }
  }

  return readNode({
    type: nativeType,
    name: fields.name,
    arguments: args,
    options,
    layout: style === 'quanx' ? 'endpoint' : style === 'loon' ? 'positional' : 'named',
  });
}

export function createIniTransform<const S extends readonly (typeof supports)[number][]>(
  provider: string,
  style: IniStyle,
  supported: S,
) {
  return createTransform({
    provider,
    supports: supported,
    readNode,
    toFields,
    toNode: (fields) => toNode(fields, style),
  });
}

export const transform = createIniTransform('ini', 'surge', supports);
