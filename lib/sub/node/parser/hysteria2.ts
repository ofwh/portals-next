import { hopping } from './hysteria';
import type { Hysteria2Node } from '../types';
import { endpoint, integer, invalid, named, oneOf, options, required, tls, uri } from '../uri';

export function parseHysteria2(body: string, scheme: string): Hysteria2Node {
  const parsed = uri(body);
  const isRealm = scheme.includes('+realm');
  const http = scheme.endsWith('+http');
  const address = endpoint(parsed.authority, http ? 80 : 443, !isRealm);
  const user = parsed.rawUser === undefined ? undefined : decodeURIComponent(parsed.rawUser);
  const password = required(isRealm ? parsed.get('auth') : user || parsed.get('password'));
  let realm;

  if (isRealm) {
    const token = required(user);
    const path = required(parsed.path);

    if (decodeURIComponent(path).includes('/')) {
      invalid();
    }

    const stun = parsed.params
      .get('stun')
      ?.map((value) => 'stun=' + encodeURIComponent(required(value)))
      .join('&');

    realm = {
      token,
      url: `${http ? 'realm+http' : 'realm'}://${parsed.authority}/${path}${stun ? '?' + stun : ''}`,
    };
  } else if (parsed.path) {
    invalid();
  }

  const obfs = parsed.get('obfs');
  const obfsPassword = parsed.get('obfs-password');

  if (obfs) {
    required(obfsPassword);
  }

  const min = parsed.get('minPacketSize', 'min_packet_size');
  const max = parsed.get('maxPacketSize', 'max_packet_size');
  const minPacketSize = min === undefined ? undefined : integer(min, 1, 65535);
  const maxPacketSize = max === undefined ? undefined : integer(max, 1, 65535);

  if (minPacketSize !== undefined && maxPacketSize !== undefined && minPacketSize > maxPacketSize) {
    invalid();
  }

  return {
    ...named(parsed, address),
    ...options(parsed),
    protocol: 'hysteria2',
    password,
    tls: tls(parsed, true),
    hysteria2: {
      ...hopping(parsed, address, true),
      certificatePin: parsed.get('pinSHA256', 'pinsha256'),
      realm,
      obfs: obfs ? oneOf(obfs, ['salamander', 'gecko']) : undefined,
      obfsPassword,
      gecko: obfs === 'gecko' ? { minPacketSize, maxPacketSize } : undefined,
    },
  };
}
