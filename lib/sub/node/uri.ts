import { ipVersion } from '@chainsafe/is-ip';
import type { PortRange, Tls } from './types';
import { PROVIDER_ERROR_CODES } from '../shared/errors';

export function invalid(): never {
  throw new Error(PROVIDER_ERROR_CODES.INVALID_URI);
}

export function required(value: string | undefined): string {
  return value || invalid();
}

export function splitAt(value: string, separator: string): [string, string | undefined] {
  const index = value.indexOf(separator);

  return index < 0 ? [value, undefined] : [value.slice(0, index), value.slice(index + separator.length)];
}

export function integer(value: string, min: number, max: number): number {
  const number = Number(value);

  if (!value || /\D/.test(value) || number < min || number > max) {
    invalid();
  }

  return number;
}

export function port(value: string): number {
  return integer(value, 1, 65535);
}

export function range(value: string): PortRange {
  const [first, last] = splitAt(value, '-');
  const start = port(first);
  const end = last === undefined ? start : port(last);

  if (end < start) {
    invalid();
  }

  return { start, end };
}

export function oneOf<const T extends string>(value: string, choices: readonly T[]): T {
  return choices.find((choice) => choice === value) ?? invalid();
}

export function host(value: string): string {
  const name = decodeURIComponent(value);

  if (name.startsWith('[') && name.endsWith(']') && ipVersion(name.slice(1, -1)) === 6) {
    return name.slice(1, -1);
  }

  if (ipVersion(name) || (name && !/[^\p{L}\p{N}_.-]/u.test(name))) {
    return name;
  }

  return invalid();
}

export function endpoint(authority: string, defaultPort?: number, allowRanges = false) {
  const match = /^(\[[^\]]+\]|[^:[\]]+)(?::(.*))?$/.exec(authority);

  if (!match) {
    return invalid();
  }

  const server = host(match[1]);
  const ports =
    match[2] === undefined
      ? [{ start: defaultPort ?? invalid(), end: defaultPort ?? invalid() }]
      : match[2].split(',').map(range);

  if (!allowRanges && (ports.length !== 1 || ports[0].start !== ports[0].end)) {
    invalid();
  }

  return { server, port: ports[0].start, ports };
}

export function uri(body: string, opaque = false) {
  if ([...body].some((character) => character <= ' ' || character.charCodeAt(0) === 127)) {
    invalid();
  }

  const [beforeFragment, fragment] = splitAt(body, '#');
  const [address, query] = splitAt(beforeFragment, '?');
  const [authority, path] = opaque ? [address, undefined] : splitAt(address, '/');
  const at = opaque ? -1 : authority.lastIndexOf('@');
  const rawUser = at < 0 ? undefined : authority.slice(0, at);
  const params = new Map<string, string[]>();

  for (const item of query?.split('&') ?? []) {
    const [key, value = ''] = splitAt(item, '=');
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    const values = params.get(decodedKey) ?? [];

    values.push(decodedValue);
    params.set(decodedKey, values);
  }

  return {
    authority: authority.slice(at + 1),
    rawUser,
    path,
    name: fragment === undefined ? undefined : decodeURIComponent(fragment),
    params,
    get: (...keys: string[]) => keys.map((key) => params.get(key)?.[0]).find((value) => value !== undefined),
  };
}

export type ShareUri = ReturnType<typeof uri>;

export function credentials(user: string, decode = true) {
  const [username, password] = splitAt(user, ':');

  if (password === undefined) {
    return invalid();
  }

  return decode
    ? { username: decodeURIComponent(username), password: decodeURIComponent(password) }
    : { username, password };
}

export function uuid(value: string): string {
  if (value.length !== 36 || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(value)) {
    invalid();
  }

  return value;
}

export function named(parsed: ShareUri, address: { server: string; port: number }) {
  const { server, port } = address;

  return {
    server,
    port,
    name: parsed.name || parsed.get('remarks') || `${ipVersion(server) === 6 ? `[${server}]` : server}:${port}`,
  };
}

export function list(value: string | undefined): string[] | undefined {
  return value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function flag(value: string | undefined): boolean | undefined {
  if (value === undefined) {
    return;
  }

  switch (value.toLowerCase()) {
    case 'true':
    case '1':
      return true;
    case 'false':
    case '0':
      return false;
    default:
      return invalid();
  }
}

export function tls({ get }: ShareUri, enabled: boolean): Tls {
  const security = get('security');

  if (security) {
    oneOf(security, ['none', 'tls', 'reality']);
  }

  const publicKey = get('pbk');

  return {
    enabled: security ? security !== 'none' : enabled,
    serverName: get('sni', 'peer', 'server_name', 'server-name'),
    allowInsecure: flag(get('allowInsecure', 'insecure', 'allow_insecure', 'allow-insecure', 'skip-cert-verify')),
    disableSni: flag(get('disable_sni', 'disable-sni')),
    tls13: flag(get('tls13')),
    alpn: list(get('alpn')),
    fingerprint: get('fp', 'fingerprint'),
    reality: security === 'reality' || publicKey ? { publicKey: required(publicKey), shortId: get('sid') } : undefined,
    ech: get('ech'),
  };
}

export function options({ get }: ShareUri) {
  return {
    udp: flag(get('udp')),
    xudp: flag(get('xudp')),
    tcpFastOpen: flag(get('tfo', 'tcp-fast-open')),
    underlyingProxy: get('underlying-proxy'),
    testUrl: get('test-url'),
  };
}
