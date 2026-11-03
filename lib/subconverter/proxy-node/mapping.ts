import { rejectNode } from './debug';
import { readFields } from './fields';
import { array, boolean, field, number, object, port, text } from '../providers/schema';
import type { ProxyNodeFields } from '../types/proxy-node/fields';
import type { Binding, Codec } from '../types/proxy-node/mapping';

export function get(value: unknown, path: string): unknown {
  let result = value;

  for (const key of path.split('.')) {
    if (result === undefined) {
      return undefined;
    }

    if (typeof result !== 'object' || result === null) {
      return undefined;
    }

    const container = result;

    result = field(container, key);
  }

  return result;
}

export function put(target: object, path: string, value: unknown): void {
  if (value === undefined) {
    return;
  }

  const keys = path.split('.');
  let current = target;

  for (let index = 0; index < keys.length - 1; index++) {
    const key = keys[index];
    let next = field(current, key);

    if (next === undefined) {
      next = /^\d+$/.test(keys[index + 1]) ? [] : {};
      Object.defineProperty(current, key, { value: next, enumerable: true, configurable: true, writable: true });
    }

    current = Array.isArray(next) ? next : object(next);
  }

  Object.defineProperty(current, keys[keys.length - 1], {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

export function remove(target: object, ...keys: string[]): void {
  for (const key of keys) {
    Reflect.deleteProperty(target, key);
  }
}

export function assertCovered(value: unknown, paths: readonly string[], prefix = ''): void {
  if (value === undefined || paths.includes(prefix)) {
    return;
  }

  if (typeof value !== 'object' || value === null) {
    rejectNode('unrepresentable-parameter');
  }

  for (const [key, item] of Object.entries(value)) {
    assertCovered(item, paths, prefix ? `${prefix}.${key}` : key);
  }
}

function numeric(value: unknown): number {
  const result = typeof value === 'string' && value.trim() ? Number(value) : value;

  return number(result);
}

function duration(value: unknown): number {
  if (typeof value === 'number') {
    return number(value);
  }

  const match = /^(\d+(?:\.\d+)?)(ms|s|m|h)?$/.exec(text(value));

  if (!match) {
    return rejectNode('invalid-duration');
  }

  return Number(match[1]) * (match[2] === 'ms' ? 0.001 : match[2] === 'm' ? 60 : match[2] === 'h' ? 3600 : 1);
}

function headers(value: unknown): { name: string; value: string[] }[] {
  return array((item) => {
    const header = object(item);
    const value = field(header, 'value');

    assertCovered(header, ['name', 'value']);

    return { name: text(field(header, 'name')), value: typeof value === 'string' ? [value] : array(text)(value) };
  })(value);
}

function peerList(value: unknown, codec: Codec, reverse: boolean): object[] {
  return array((item) => {
    const source = object(item);
    const serverKey = codec === 'endpointPeers' ? 'address' : 'server';
    const portKey = codec === 'singBoxPeers' ? 'serverPort' : 'port';
    const keepAliveKey = codec === 'clashPeers' ? 'keepAlive' : 'persistentKeepaliveInterval';
    const input = reverse
      ? { server: field(source, 'server'), port: field(source, 'port'), keepAlive: field(source, 'keepAlive') }
      : { server: field(source, serverKey), port: field(source, portKey), keepAlive: field(source, keepAliveKey) };
    const result = {
      publicKey: text(field(source, 'publicKey')),
      ...(field(source, 'preSharedKey') !== undefined ? { preSharedKey: text(field(source, 'preSharedKey')) } : {}),
      ...(field(source, 'allowedIps') !== undefined ? { allowedIps: array(text)(field(source, 'allowedIps')) } : {}),
      ...(field(source, 'reserved') !== undefined ? { reserved: array(number)(field(source, 'reserved')) } : {}),
    };

    const server = text(input.server);
    const publicKey = text(field(source, 'publicKey'));
    const reserved = field(source, 'reserved');

    if (!server || /[\s/?#]/.test(server) || !publicKey) {
      return rejectNode('invalid-wireguard-peer');
    }

    if (
      reserved !== undefined &&
      (!Array.isArray(reserved) ||
        reserved.length !== 3 ||
        reserved.some((item) => typeof item !== 'number' || !Number.isInteger(item) || item < 0 || item > 255))
    ) {
      return rejectNode('invalid-wireguard-reserved');
    }

    put(result, reverse ? serverKey : 'server', server);
    put(result, reverse ? portKey : 'port', Number(port(input.port)));
    put(
      result,
      reverse ? keepAliveKey : 'keepAlive',
      input.keepAlive === undefined ? undefined : number(input.keepAlive),
    );
    assertCovered(
      source,
      reverse
        ? ['server', 'port', 'publicKey', 'preSharedKey', 'allowedIps', 'reserved', 'keepAlive']
        : [serverKey, portKey, 'publicKey', 'preSharedKey', 'allowedIps', 'reserved', keepAliveKey],
    );

    return result;
  })(value);
}

export function convert(value: unknown, codec: Codec | undefined, reverse = false): unknown {
  if (value === undefined || !codec) {
    return value;
  }

  switch (codec) {
    case 'port':
      return Number(port(value));
    case 'number':
      return numeric(value);
    case 'boolean':
    case 'booleanText': {
      const result =
        typeof value === 'string' && ['true', 'false', '1', '0'].includes(value)
          ? value === 'true' || value === '1'
          : boolean(value);

      return reverse && codec === 'booleanText' ? String(result) : result;
    }
    case 'duration':
      return reverse ? `${number(value)}s` : duration(value);
    case 'seconds':
      return duration(value);
    case 'numberText':
      return reverse ? String(number(value)) : numeric(value);
    case 'strings':
      return typeof value === 'string' ? [value] : array(text)(value);
    case 'tlsMode': {
      if (reverse) {
        return boolean(value) ? 'tls' : 'none';
      }

      const mode = text(value).toLowerCase();

      if (!['', 'none', 'tls', 'true', 'false', '1', '0'].includes(mode)) {
        return rejectNode('unsupported-tls-mode');
      }

      return ['tls', 'true', '1'].includes(mode);
    }
    case 'grpcMode': {
      if (!reverse) {
        return boolean(value) ? 'multi' : 'gun';
      }

      if (!['gun', 'multi'].includes(text(value))) {
        return rejectNode('unsupported-grpc-mode');
      }

      return value === 'multi';
    }
    case 'comma':
      return reverse ? array(text)(value).join(',') : text(value).split(',').filter(Boolean);
    case 'iniHeaders': {
      if (!reverse) {
        return text(value)
          .split('|')
          .filter(Boolean)
          .map((item) => {
            const split = item.includes(':') ? item.indexOf(':') : item.indexOf('=');

            if (split < 1) {
              return rejectNode('invalid-header');
            }

            return { name: item.slice(0, split).trim(), value: [item.slice(split + 1).trim()] };
          });
      }

      return headers(value)
        .map((item) => {
          if (item.value.length !== 1 || /[|\r\n]/.test(item.value[0])) {
            return rejectNode('unrepresentable-header');
          }

          return `${item.name}:${item.value[0]}`;
        })
        .join('|');
    }
    case 'hostHeaderSingle': {
      if (!reverse) {
        return [{ name: 'Host', value: [text(value)] }];
      }

      const values = headers(value);

      if (values.length !== 1 || values[0].name.toLowerCase() !== 'host' || values[0].value.length !== 1) {
        return rejectNode('unrepresentable-header');
      }

      return values[0].value[0];
    }
    case 'text':
      return typeof value === 'number' ? String(value) : text(value);
    case 'list': {
      if (!reverse) {
        return typeof value === 'string' ? [value] : array(text)(value);
      }

      const values = array(text)(value);

      if (values.length !== 1) {
        return rejectNode('unrepresentable-list');
      }

      return values[0];
    }
    case 'ports':
      return reverse
        ? array(text)(value).join(',')
        : typeof value === 'string'
          ? value.split(',').map((part) => part.trim())
          : array(text)(value);
    case 'single': {
      if (reverse) {
        return [text(value)];
      }

      const values = typeof value === 'string' ? [value] : array(text)(value);

      if (values.length !== 1) {
        return rejectNode('unrepresentable-list');
      }

      return values[0];
    }
    case 'bandwidth': {
      if (reverse) {
        return `${number(value)} Mbps`;
      }

      if (typeof value === 'number') {
        return number(value);
      }

      const match = /^(\d+(?:\.\d+)?)\s*([kmg]?)([bB])?(?:ps)?$/i.exec(text(value));

      if (!match) {
        return rejectNode('invalid-bandwidth');
      }

      const scale = match[2].toLowerCase() === 'k' ? 0.001 : match[2].toLowerCase() === 'g' ? 1000 : 1;

      return Number(match[1]) * scale * (match[3] === 'B' ? 8 : 1);
    }
    case 'headersList':
      return headers(value);
    case 'headersSingle':
      return headers(value).map((header) => {
        if (reverse && header.value.length !== 1) {
          return rejectNode('unrepresentable-header');
        }

        return { name: header.name, value: reverse ? header.value[0] : header.value };
      });
    case 'hostHeaders': {
      if (!reverse) {
        return [{ name: 'Host', value: typeof value === 'string' ? [value] : array(text)(value) }];
      }

      const values = headers(value);

      if (values.some((header) => header.name.toLowerCase() !== 'host')) {
        return rejectNode('unrepresentable-header');
      }

      return values.flatMap((header) => header.value);
    }
    case 'ipv4':
    case 'ipv6': {
      if (!reverse) {
        const address = text(value);

        return [address.includes('/') ? address : `${address}/${codec === 'ipv4' ? 32 : 128}`];
      }

      const addresses = array(text)(value).filter((address) => address.includes(':') === (codec === 'ipv6'));

      if (addresses.length > 1) {
        return rejectNode('unrepresentable-addresses');
      }

      return addresses[0];
    }
    case 'clashPeers':
    case 'singBoxPeers':
    case 'endpointPeers':
      return peerList(value, codec, reverse);
  }
}

function merge(target: object, key: string, value: unknown): void {
  const previous = field(target, key);

  if (previous === undefined) {
    put(target, key, value);
  } else if (key === 'localAddresses') {
    put(target, key, [...new Set([...array(text)(previous), ...array(text)(value)])]);
  } else if (key === 'headers') {
    const combined = headers(previous);

    for (const header of headers(value)) {
      const existing = combined.find((item) => item.name.toLowerCase() === header.name.toLowerCase());

      if (existing && JSON.stringify(existing.value) !== JSON.stringify(header.value)) {
        rejectNode('conflicting-header');
      }

      if (!existing) {
        combined.push(header);
      }
    }

    put(target, key, combined);
  } else if (JSON.stringify(previous) !== JSON.stringify(value)) {
    rejectNode('conflicting-alias');
  }
}

export function flatten(
  type: ProxyNodeFields['type'],
  node: object,
  bindings: readonly Binding[],
  ignored: readonly string[] = ['type'],
  defaults: object = {},
): ProxyNodeFields {
  const result = { ...defaults, type };
  const used = [...ignored];
  const network = get(node, 'network') ?? 'tcp';

  for (const binding of bindings) {
    const value = get(node, binding.path);

    if (value === undefined || (binding.network && network !== binding.network)) {
      continue;
    }

    merge(result, binding.field, convert(value, binding.codec));
    used.push(binding.path);
  }

  assertCovered(node, used);
  if (!get(result, 'name')) {
    put(result, 'name', get(result, 'server') ? `${get(result, 'server')}:${get(result, 'port') ?? ''}` : type);
  }

  if (type === 'mieru' && get(result, 'port') === undefined) {
    const ranges = get(result, 'ports');

    if (Array.isArray(ranges) && typeof ranges[0] === 'string') {
      put(result, 'port', Number(port(ranges[0].split(/[:-]/)[0])));
    }
  }

  if (['hysteria', 'hysteria2', 'naive'].includes(type) && get(result, 'port') === undefined) {
    put(result, 'port', 443);
  }

  return validateFields(result);
}

export function expand(
  node: ProxyNodeFields,
  bindings: readonly Binding[],
  initial: object = {},
  fixed: object = {},
): object {
  const fields = validateFields(node);
  const result = { ...initial };
  const used = new Set<string>(['type']);
  const network = get(fields, 'network') ?? 'tcp';

  for (const [key, expected] of Object.entries(fixed)) {
    const actual = get(fields, key);

    if (actual !== undefined && JSON.stringify(actual) !== JSON.stringify(expected)) {
      rejectNode('unrepresentable-parameter');
    }

    used.add(key);
  }

  for (const binding of bindings) {
    const value = get(fields, binding.field);
    const address = binding.codec === 'ipv4' || binding.codec === 'ipv6';

    if (
      value === undefined ||
      (binding.network && network !== binding.network) ||
      (used.has(binding.field) && !address)
    ) {
      continue;
    }

    const converted = convert(value, binding.codec, true);

    put(result, binding.path, converted);
    if (converted !== undefined || address) {
      used.add(binding.field);
    }
  }

  assertCovered(fields, [...used]);

  return result;
}

export function validateFields(value: unknown): ProxyNodeFields {
  const result = readFields(value);

  if (!result.name.trim() || /[\r\n]/.test(result.name)) {
    return rejectNode('invalid-name');
  }

  if ('port' in result && result.port !== undefined) {
    port(result.port);
  }

  for (const key of ['server', 'password', 'uuid', 'cipher', 'username']) {
    const item = get(result, key);

    const required =
      ['server', 'uuid', 'cipher'].includes(key) ||
      (key === 'username' && result.type === 'mieru') ||
      (key === 'password' &&
        ['ss', 'ssr', 'trojan', 'snell', 'hysteria2', 'anytls', 'naive', 'mieru'].includes(result.type));

    if (item !== undefined && (typeof item !== 'string' || (required && !item.length) || /[\r\n]/.test(item))) {
      return rejectNode('invalid-required-field');
    }
  }

  if (
    ['vmess', 'vless', 'trojan', 'http', 'https', 'hysteria', 'hysteria2', 'tuic', 'anytls', 'naive'].includes(
      result.type,
    )
  ) {
    if (get(result, 'clientFingerprint') === 'none' && get(result, 'utlsEnabled') === undefined) {
      put(result, 'utlsEnabled', false);
      remove(result, 'clientFingerprint');
    } else if (get(result, 'clientFingerprint') !== undefined && get(result, 'utlsEnabled') === undefined) {
      put(result, 'utlsEnabled', true);
    }

    if (
      get(result, 'realityPublicKey') !== undefined &&
      get(result, 'realityEnabled') === undefined &&
      ['vmess', 'vless', 'trojan'].includes(result.type)
    ) {
      put(result, 'realityEnabled', true);
    }
  }

  if (['trojan', 'anytls', 'hysteria', 'hysteria2', 'tuic', 'naive', 'https'].includes(result.type)) {
    if (get(result, 'tls') === false) {
      return rejectNode('invalid-protocol-tls');
    }

    put(result, 'tls', true);
  }

  if (result.type === 'socks5' && result.version !== undefined && result.version !== '5') {
    return rejectNode('unsupported-socks-version');
  }

  if (result.type === 'http' && result.tls === true) {
    return rejectNode('invalid-protocol-tls');
  }

  if (result.type === 'tuic' && !result.token && (!result.uuid || !result.password)) {
    return rejectNode('missing-tuic-authentication');
  }

  if (result.type === 'ssr' && (!result.protocol || !result.obfs)) {
    return rejectNode('missing-ssr-parameters');
  }

  for (const key of [
    'alterId',
    'snellVersion',
    'snellUdpPort',
    'minIdleSession',
    'naiveInsecureConcurrency',
    'mtu',
    'idleSessionCheckInterval',
    'idleSessionTimeout',
    'upMbps',
    'downMbps',
    'hopInterval',
  ]) {
    const numericValue = get(result, key);

    if (typeof numericValue === 'number' && numericValue < 0) {
      return rejectNode('invalid-numeric-parameter');
    }
  }
  if ('ports' in result && result.ports) {
    for (const range of result.ports) {
      const match = /^(\d+)(?:[:-](\d+))?$/.exec(range);

      if (!match || Number(port(match[1])) > Number(port(match[2] ?? match[1]))) {
        return rejectNode('invalid-port-range');
      }
    }
  }

  if (result.type === 'wireguard') {
    if (!result.privateKey) {
      return rejectNode('missing-wireguard-private-key');
    }

    if (result.keepAlive !== undefined) {
      for (const peer of result.wireGuardPeers) {
        if (peer.keepAlive !== undefined && peer.keepAlive !== result.keepAlive) {
          return rejectNode('conflicting-wireguard-keepalive');
        }

        peer.keepAlive = result.keepAlive;
      }
      remove(result, 'keepAlive');
    }

    if (!result.localAddresses.length || !result.wireGuardPeers.length) {
      return rejectNode('missing-wireguard-configuration');
    }

    peerList(result.wireGuardPeers, 'clashPeers', true);
  }

  return result;
}

export function projectWireGuard(value: object, style: 'clash' | 'sing-box'): object {
  const result = { ...value };
  const portKey = style === 'clash' ? 'port' : 'serverPort';
  const publicKey = style === 'clash' ? 'publicKey' : 'peerPublicKey';
  const flatKeys = ['server', portKey, publicKey, 'preSharedKey', 'reserved', 'allowedIps'];
  const peers = get(value, 'peers');

  if (peers !== undefined && flatKeys.some((key) => get(value, key) !== undefined)) {
    return rejectNode('ambiguous-wireguard-peers');
  }

  if (peers === undefined) {
    const peer = {
      server: text(get(value, 'server')),
      [portKey]: Number(port(get(value, portKey))),
      publicKey: text(get(value, publicKey)),
    };

    for (const key of ['preSharedKey', 'reserved', 'allowedIps']) {
      put(peer, key, get(value, key));
    }
    put(result, 'peers', [peer]);
    remove(result, ...flatKeys);
  }

  return result;
}

export function nativeFingerprint(fields: ProxyNodeFields): { value?: string; fixed: object } {
  const enabled = get(fields, 'utlsEnabled');
  const fingerprint = get(fields, 'clientFingerprint');

  if (enabled === false) {
    if (fingerprint !== undefined) {
      return rejectNode('unrepresentable-disabled-fingerprint');
    }

    return { value: 'none', fixed: { utlsEnabled: false } };
  }

  return {
    value: fingerprint === undefined ? (enabled === true ? 'chrome' : undefined) : text(fingerprint),
    fixed: enabled === undefined ? {} : { utlsEnabled: boolean(enabled) },
  };
}
