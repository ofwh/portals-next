import { decodeBase64 } from '../../shared/base64';
import type { ShadowsocksNode } from '../types';
import { credentials, endpoint, invalid, named, options, required, splitAt, uri } from '../uri';

export function plugin(value: string | undefined) {
  if (!value) {
    return;
  }

  const [name, ...fields] = value.split(';');

  return {
    name: required(name),
    options: Object.fromEntries(
      fields.filter(Boolean).map((field) => {
        const [key, parameter] = splitAt(field, '=');

        return [required(key), parameter ?? true] as const;
      }),
    ),
  };
}

export function parseSs(body: string): ShadowsocksNode {
  const address = body.split(/[?#]/, 1)[0];
  const parsed = uri(body, !address.includes('@'));

  if (parsed.path) {
    invalid();
  }

  let authority = parsed.authority;
  let user = parsed.rawUser;
  let decode = true;

  if (user === undefined) {
    const encoded = decodeURIComponent(authority);
    const payload = decodeBase64(encoded.endsWith('/') ? encoded.slice(0, -1) : encoded);
    const at = payload.lastIndexOf('@');

    if (at < 0) {
      invalid();
    }

    authority = payload.slice(at + 1);
    user = payload.slice(0, at);
    decode = false;
  } else if (!user.includes(':')) {
    user = decodeBase64(decodeURIComponent(user));
    decode = false;
  }

  const { username, password } = credentials(user, decode);

  return {
    ...named(parsed, endpoint(authority)),
    ...options(parsed),
    protocol: 'ss',
    method: required(username),
    password: required(password),
    plugin: plugin(parsed.get('plugin')),
  };
}
