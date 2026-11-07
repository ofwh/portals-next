import { transport, xrayOptions, xrayTransport } from './xray';
import { decodeBase64 } from '../../shared/base64';
import type { VMessNode } from '../types';
import {
  credentials,
  endpoint,
  flag,
  host,
  integer,
  invalid,
  named,
  options,
  port,
  required,
  splitAt,
  tls,
  uri,
  uuid,
} from '../uri';

function parseJson(payload: string, parsed: ReturnType<typeof uri>): VMessNode {
  const value: unknown = JSON.parse(payload);

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalid();
  }

  const fields: Record<string, unknown> = { ...value };
  const get = (key: string) => {
    const field = fields[key];

    if (field === undefined) {
      return;
    }

    if (typeof field === 'number' || typeof field === 'string' || typeof field === 'boolean') {
      return String(field);
    }

    return invalid();
  };
  const version = get('v') || '1';

  if (version !== '1' && version !== '2') {
    invalid();
  }

  const kind = get('net') || 'tcp';
  const hostField = get('host') || '';
  const [transportHost, legacyPath] = version === '1' ? splitAt(hostField, ';') : [hostField];
  const path = legacyPath ?? get('path');
  const security = get('tls');
  const read = (...keys: string[]) => keys.map(get).find((field) => field !== undefined);

  return {
    ...named(
      { ...parsed, name: parsed.name || get('ps') },
      {
        server: host(required(get('add')).trim()),
        port: port(required(get('port'))),
      },
    ),
    protocol: 'vmess',
    uuid: uuid(required(get('id'))),
    alterId: integer(get('aid') || '0', 0, 65535),
    encryption: get('scy') || get('encryption') || 'auto',
    transport: transport(kind, {
      host: transportHost || undefined,
      path: kind === 'grpc' ? undefined : path,
      serviceName: kind === 'grpc' ? path : undefined,
      mode: kind === 'grpc' || kind === 'xhttp' ? get('type') : undefined,
      headerType: get('type'),
    }),
    tls: tls({ ...parsed, get: (...keys) => (keys[0] === 'security' ? security || undefined : read(...keys)) }, false),
    xray: xrayOptions(get),
  };
}

function parseQuantumult(payload: string, parsed: ReturnType<typeof uri>): VMessNode {
  const [name, config] = splitAt(payload, ' = ');
  const [protocol, server, remotePort, encryption, id, ...fields] = required(config)
    .split(',')
    .map((item) => item.trim());

  if (protocol !== 'vmess') {
    invalid();
  }

  const params = new Map(
    fields.map((field) => {
      const [key, value] = splitAt(field, '=');

      return [key.trim(), value?.trim().replace(/^"|"$/g, '')] as const;
    }),
  );
  const headers = new Map(
    params
      .get('obfs-header')
      ?.split(/\[rn\]\[rn\]/i)
      .map((field) => {
        const [key, value] = splitAt(field, ':');

        return [key.toLowerCase(), value?.trim()] as const;
      }),
  );

  return {
    ...named(
      { ...parsed, name: parsed.name || name.trim() },
      { server: host(required(server)), port: port(required(remotePort)) },
    ),
    protocol: 'vmess',
    uuid: uuid(required(id).replace(/^"|"$/g, '')),
    alterId: 0,
    encryption: required(encryption),
    transport: transport(params.get('obfs') === 'ws' ? 'ws' : 'tcp', {
      host: headers.get('host'),
      edge: headers.get('edge'),
      path: params.get('obfs-path') || '/',
    }),
    tls: { enabled: flag(params.get('over-tls')) ?? false, serverName: params.get('tls-host') },
  };
}

export function parseVmess(body: string): VMessNode {
  const address = body.split(/[?#]/, 1)[0];
  const parsed = uri(body, !address.includes('@'));
  let authority = parsed.authority;
  let user = parsed.rawUser;
  let cipher = parsed.get('encryption') || 'auto';
  let kind: string | undefined;
  let legacyTls = false;
  let alterId = parsed.get('aid') || '0';

  if (user === undefined) {
    const payload = decodeBase64(decodeURIComponent(authority));

    if (payload.trimStart().startsWith('{')) {
      return parseJson(payload, parsed);
    }

    if (payload.includes(' = ')) {
      return parseQuantumult(payload, parsed);
    }

    const at = payload.lastIndexOf('@');

    if (at < 0) {
      invalid();
    }

    authority = payload.slice(at + 1);
    const account = credentials(payload.slice(0, at), false);

    cipher = required(account.username);
    user = account.password;
    if (parsed.get('obfs') === 'websocket') {
      kind = 'ws';
    }
  } else {
    user = decodeURIComponent(user);
    const legacy = /^([a-z]+)(\+tls)?:([\da-f-]+)-(\d+)$/i.exec(user);

    if (legacy) {
      [, kind, , user, alterId] = legacy;
      legacyTls = Boolean(legacy[2]);
    }
  }

  return {
    ...named(parsed, endpoint(authority)),
    ...options(parsed),
    protocol: 'vmess',
    uuid: uuid(user),
    alterId: integer(alterId, 0, 65535),
    encryption: cipher,
    transport: {
      ...xrayTransport(parsed, kind),
      host: parsed.get('host', 'ws.host', 'wsHost', 'obfsParam'),
      path: parsed.get('path', 'wspath') ?? (parsed.path ? '/' + decodeURIComponent(parsed.path) : undefined),
    },
    tls: tls(parsed, legacyTls || (flag(parsed.get('tls')) ?? false)),
    xray: xrayOptions(parsed.get),
  };
}
