// SPDX-License-Identifier: GPL-3.0-only
// Adapted from victorymt/subconverter-mihomo-worker (50f6719), see ../NOTICE.md.
import { isRecord } from '../../../../../utils';
import type { ClashProxy } from '../../types';
import { decodeBase64Utf8, decodeUrlComponent, parseBoolean, parseInteger } from '../../utils';

function text(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return undefined;
}

function requiredPort(value: unknown): number {
  const port = parseInteger(value);

  if (port == null || port < 1 || port > 65_535) {
    throw new Error('Invalid proxy port');
  }

  return port;
}

function requiredText(value: unknown, field: string): string {
  const parsed = text(value)?.trim();

  if (!parsed) {
    throw new Error(`Missing ${field}`);
  }

  return parsed;
}

function displayName(url: URL, fallback: string): string {
  const fragment = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;

  return decodeUrlComponent(fragment).trim() || fallback;
}

function urlCredential(url: URL): string {
  const username = decodeUrlComponent(url.username);
  const password = decodeUrlComponent(url.password);

  return password ? `${username}:${password}` : username;
}

function queryBoolean(search: URLSearchParams, ...names: string[]): boolean | undefined {
  for (const name of names) {
    const result = parseBoolean(search.get(name));

    if (result != null) {
      return result;
    }
  }

  return undefined;
}

function commaList(value: string | null): string[] | undefined {
  const items = value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return items?.length ? items : undefined;
}

function applyTransport(
  proxy: ClashProxy,
  network: string | null | undefined,
  search: URLSearchParams,
  defaults: { host?: string | undefined; path?: string | undefined } = {},
): void {
  const normalized = network?.toLowerCase() || 'tcp';
  const host = search.get('host') || defaults.host;
  const path = decodeUrlComponent(search.get('path') || defaults.path || '');

  if (normalized === 'tcp') {
    return;
  }

  proxy.network = normalized;
  if (normalized === 'ws') {
    const options: Record<string, unknown> = { path: path || '/' };

    if (host) {
      options.headers = { Host: host };
    }

    const earlyData = parseInteger(search.get('ed'));

    if (earlyData != null) {
      options['max-early-data'] = earlyData;
      options['early-data-header-name'] = search.get('eh') || 'Sec-WebSocket-Protocol';
    }

    proxy['ws-opts'] = options;

    return;
  }

  if (normalized === 'grpc') {
    proxy['grpc-opts'] = {
      'grpc-service-name': search.get('serviceName') || search.get('service-name') || path,
    };

    return;
  }

  if (normalized === 'http' || normalized === 'h2') {
    const options: Record<string, unknown> = {};

    if (path) {
      options.path = normalized === 'http' ? [path] : path;
    }

    if (host) {
      if (normalized === 'http') {
        options.headers = { Host: [host] };
      } else {
        options.host = [host];
      }
    }

    proxy[`${normalized}-opts`] = options;
  }
}

function parseStandardUrl(link: string): URL {
  const url = new URL(link);

  if (!url.hostname) {
    throw new Error('Missing proxy server');
  }

  return url;
}

function parseVless(link: string): ClashProxy {
  const url = parseStandardUrl(link);
  const search = url.searchParams;
  const proxy: ClashProxy = {
    name: displayName(url, url.hostname),
    type: 'vless',
    server: url.hostname,
    port: requiredPort(url.port),
    uuid: requiredText(decodeUrlComponent(url.username), 'uuid'),
    udp: true,
  };

  const flow = search.get('flow');

  if (flow) {
    proxy.flow = flow;
  }

  const security = search.get('security')?.toLowerCase();

  if (security === 'tls' || security === 'reality') {
    proxy.tls = true;
    const servername = search.get('sni') || search.get('servername');

    if (servername) {
      proxy.servername = servername;
    }

    const fingerprint = search.get('fp');

    if (fingerprint) {
      proxy['client-fingerprint'] = fingerprint;
    }

    const alpn = commaList(search.get('alpn'));

    if (alpn) {
      proxy.alpn = alpn;
    }

    const insecure = queryBoolean(search, 'allowInsecure', 'insecure', 'skip-cert-verify');

    if (insecure != null) {
      proxy['skip-cert-verify'] = insecure;
    }
  }

  if (security === 'reality') {
    const reality: Record<string, unknown> = {};
    const publicKey = search.get('pbk') || search.get('public-key');
    const shortId = search.get('sid') || search.get('short-id');

    if (publicKey) {
      reality['public-key'] = publicKey;
    }

    if (shortId) {
      reality['short-id'] = shortId;
    }

    proxy['reality-opts'] = reality;
  }

  applyTransport(proxy, search.get('type') || search.get('network'), search);

  return proxy;
}

function parseTrojan(link: string): ClashProxy {
  const url = parseStandardUrl(link);
  const search = url.searchParams;
  const proxy: ClashProxy = {
    name: displayName(url, url.hostname),
    type: 'trojan',
    server: url.hostname,
    port: requiredPort(url.port),
    password: requiredText(urlCredential(url), 'password'),
    udp: true,
  };
  const servername = search.get('sni') || search.get('peer') || search.get('servername');

  if (servername) {
    proxy.sni = servername;
  }

  const insecure = queryBoolean(search, 'allowInsecure', 'insecure', 'skip-cert-verify');

  if (insecure != null) {
    proxy['skip-cert-verify'] = insecure;
  }

  const fingerprint = search.get('fp');

  if (fingerprint) {
    proxy['client-fingerprint'] = fingerprint;
  }

  const alpn = commaList(search.get('alpn'));

  if (alpn) {
    proxy.alpn = alpn;
  }

  applyTransport(proxy, search.get('type') || search.get('network'), search);

  return proxy;
}

// Added locally from the Hysteria v1 URI scheme and Mihomo field names.
function parseHysteria(link: string): ClashProxy {
  const url = parseStandardUrl(link);
  const search = url.searchParams;
  const protocol = search.get('protocol') || 'udp';

  if (!['udp', 'wechat-video', 'faketcp'].includes(protocol)) {
    throw new Error('Invalid Hysteria protocol');
  }

  const proxy: ClashProxy = {
    name: displayName(url, url.hostname),
    type: 'hysteria',
    server: url.hostname,
    port: requiredPort(url.port),
    protocol,
    up: requiredText(search.get('upmbps') || search.get('up'), 'upmbps'),
    down: requiredText(search.get('downmbps') || search.get('down'), 'downmbps'),
  };
  const auth = search.get('auth') || urlCredential(url);

  if (auth) {
    proxy['auth-str'] = auth;
  }

  const sni = search.get('peer') || search.get('sni');

  if (sni) {
    proxy.sni = sni;
  }

  const obfsMode = search.get('obfs');

  if (obfsMode && obfsMode !== 'xplus') {
    throw new Error('Unsupported Hysteria obfuscation');
  }

  const obfs = search.get('obfsParam');

  if (obfs) {
    proxy.obfs = obfs;
  }

  const insecure = queryBoolean(search, 'insecure', 'allowInsecure', 'skip-cert-verify');

  if (insecure != null) {
    proxy['skip-cert-verify'] = insecure;
  }

  const alpn = commaList(search.get('alpn'));

  if (alpn) {
    proxy.alpn = alpn;
  }

  return proxy;
}

function parseHysteria2(link: string): ClashProxy {
  const url = parseStandardUrl(link.replace(/^hy2:/i, 'hysteria2:'));
  const search = url.searchParams;
  const proxy: ClashProxy = {
    name: displayName(url, url.hostname),
    type: 'hysteria2',
    server: url.hostname,
    port: requiredPort(url.port || '443'),
    password: requiredText(urlCredential(url), 'password'),
  };
  const ports = search.get('ports') || search.get('mport');

  if (ports) {
    proxy.ports = ports;
  }

  const sni = search.get('sni');

  if (sni) {
    proxy.sni = sni;
  }

  const obfs = search.get('obfs');

  if (obfs) {
    proxy.obfs = obfs;
  }

  const obfsPassword = search.get('obfs-password') || search.get('obfsPassword');

  if (obfsPassword) {
    proxy['obfs-password'] = obfsPassword;
  }

  const insecure = queryBoolean(search, 'insecure', 'allowInsecure', 'skip-cert-verify');

  if (insecure != null) {
    proxy['skip-cert-verify'] = insecure;
  }

  const fingerprint = search.get('pinSHA256') || search.get('fingerprint');

  if (fingerprint) {
    proxy.fingerprint = fingerprint;
  }

  const alpn = commaList(search.get('alpn'));

  if (alpn) {
    proxy.alpn = alpn;
  }

  return proxy;
}

function parseAnyTls(link: string): ClashProxy {
  const url = parseStandardUrl(link);
  const search = url.searchParams;
  const proxy: ClashProxy = {
    name: displayName(url, url.hostname),
    type: 'anytls',
    server: url.hostname,
    port: requiredPort(url.port),
    password: requiredText(urlCredential(url), 'password'),
    udp: true,
  };
  const sni = search.get('sni') || search.get('peer');

  if (sni) {
    proxy.servername = sni;
  }

  const insecure = queryBoolean(search, 'insecure', 'allowInsecure', 'skip-cert-verify');

  if (insecure != null) {
    proxy['skip-cert-verify'] = insecure;
  }

  const fingerprint = search.get('fp');

  if (fingerprint) {
    proxy['client-fingerprint'] = fingerprint;
  }

  for (const [queryName, outputName] of [
    ['idle-session-check-interval', 'idle-session-check-interval'],
    ['idle-session-timeout', 'idle-session-timeout'],
    ['min-idle-session', 'min-idle-session'],
  ] as const) {
    const value = parseInteger(search.get(queryName));

    if (value != null) {
      proxy[outputName] = value;
    }
  }

  return proxy;
}

function parseVmess(link: string): ClashProxy {
  const encoded = link.slice('vmess://'.length).split('#', 1)[0] ?? '';
  const raw: unknown = JSON.parse(decodeBase64Utf8(encoded));

  if (!isRecord(raw)) {
    throw new Error('Invalid VMess configuration');
  }

  const server = requiredText(raw.add, 'server');
  const network = text(raw.net) || 'tcp';
  const proxy: ClashProxy = {
    name: text(raw.ps) || server,
    type: 'vmess',
    server,
    port: requiredPort(raw.port),
    uuid: requiredText(raw.id, 'uuid'),
    alterId: parseInteger(raw.aid) ?? 0,
    cipher: text(raw.scy) || text(raw.cipher) || 'auto',
    udp: true,
  };

  if (raw.tls === true || text(raw.tls)?.toLowerCase() === 'tls') {
    proxy.tls = true;
  }

  const servername = text(raw.sni);

  if (servername) {
    proxy.servername = servername;
  }

  const fingerprint = text(raw.fp);

  if (fingerprint) {
    proxy['client-fingerprint'] = fingerprint;
  }

  const alpn = commaList(text(raw.alpn) ?? null);

  if (alpn) {
    proxy.alpn = alpn;
  }

  const search = new URLSearchParams();
  const host = text(raw.host);
  const path = text(raw.path);

  if (host) {
    search.set('host', host);
  }

  if (path) {
    search.set('path', path);
  }

  const serviceName = text(raw.serviceName);

  if (serviceName) {
    search.set('serviceName', serviceName);
  }

  applyTransport(proxy, network, search, { host, path });

  return proxy;
}

function parseShadowsocks(link: string): ClashProxy {
  let remainder = link.slice('ss://'.length);
  let fragment = '';
  const hashIndex = remainder.indexOf('#');

  if (hashIndex >= 0) {
    fragment = remainder.slice(hashIndex + 1);
    remainder = remainder.slice(0, hashIndex);
  }

  let query = '';
  const queryIndex = remainder.indexOf('?');

  if (queryIndex >= 0) {
    query = remainder.slice(queryIndex + 1);
    remainder = remainder.slice(0, queryIndex);
  }

  if (!remainder.includes('@')) {
    remainder = decodeBase64Utf8(remainder);
  }

  const atIndex = remainder.lastIndexOf('@');

  if (atIndex < 1) {
    throw new Error('Invalid Shadowsocks URL');
  }

  let userInfo = remainder.slice(0, atIndex);
  const serverPart = remainder.slice(atIndex + 1);

  if (!userInfo.includes(':')) {
    userInfo = decodeBase64Utf8(userInfo);
  }

  const colonIndex = userInfo.indexOf(':');

  if (colonIndex < 1) {
    throw new Error('Invalid Shadowsocks credentials');
  }

  const serverUrl = new URL(`ss://${serverPart}`);
  const proxy: ClashProxy = {
    name: decodeUrlComponent(fragment).trim() || serverUrl.hostname,
    type: 'ss',
    server: serverUrl.hostname,
    port: requiredPort(serverUrl.port),
    cipher: decodeUrlComponent(userInfo.slice(0, colonIndex)),
    password: decodeUrlComponent(userInfo.slice(colonIndex + 1)),
    udp: true,
  };

  const pluginValue = new URLSearchParams(query).get('plugin');

  if (pluginValue) {
    const [pluginName, ...rawOptions] = pluginValue.split(';');

    if (pluginName === 'obfs-local' || pluginName === 'simple-obfs') {
      proxy.plugin = 'obfs';
    } else if (pluginName) {
      proxy.plugin = pluginName;
    }

    const options: Record<string, unknown> = {};

    for (const option of rawOptions) {
      const separator = option.indexOf('=');
      const key = separator >= 0 ? option.slice(0, separator) : option;
      const value = separator >= 0 ? option.slice(separator + 1) : 'true';

      if (key === 'obfs') {
        options.mode = value;
      } else if (key === 'obfs-host') {
        options.host = value;
      } else {
        options[key] = value === 'true' ? true : value;
      }
    }
    if (Object.keys(options).length) {
      proxy['plugin-opts'] = options;
    }
  }

  return proxy;
}

export function parseShareLink(link: string): ClashProxy | undefined {
  const trimmed = link.trim().replace(/^([a-z0-9]+):/i, (_, scheme: string) => `${scheme.toLowerCase()}:`);

  try {
    if (/^ss:\/\//i.test(trimmed)) {
      return parseShadowsocks(trimmed);
    }

    if (/^vmess:\/\//i.test(trimmed)) {
      return parseVmess(trimmed);
    }

    if (/^vless:\/\//i.test(trimmed)) {
      return parseVless(trimmed);
    }

    if (/^trojan:\/\//i.test(trimmed)) {
      return parseTrojan(trimmed);
    }

    if (/^(hysteria2|hy2):\/\//i.test(trimmed)) {
      return parseHysteria2(trimmed);
    }

    if (/^hysteria:\/\//i.test(trimmed)) {
      return parseHysteria(trimmed);
    }

    if (/^anytls:\/\//i.test(trimmed)) {
      return parseAnyTls(trimmed);
    }
  } catch {
    return undefined;
  }

  return undefined;
}
