import { decodeBase64 } from '../../shared/base64';
import type { ShadowsocksRNode } from '../types';
import { endpoint, invalid, named, required, uri } from '../uri';

export function parseSsr(body: string): ShadowsocksRNode {
  const parsed = uri(decodeBase64(body).replace('/?', '?'), true);
  const match = /^(.*):(\d+):([^:]+):([^:]+):([^:]+):([^:]+)$/.exec(parsed.authority);

  if (!match || parsed.rawUser || parsed.path) {
    return invalid();
  }

  const [, server, port, protocol, method, obfs, encoded] = match;
  const decode = (key: string) => {
    const value = parsed.get(key);

    return value === undefined ? undefined : decodeBase64(value);
  };

  return {
    ...named({ ...parsed, name: decode('remarks') }, endpoint(`${server}:${port}`)),
    protocol: 'ssr',
    method,
    password: required(decodeBase64(encoded)),
    ssr: { protocol, protocolParam: decode('protoparam'), obfs, obfsParam: decode('obfsparam') },
  };
}
