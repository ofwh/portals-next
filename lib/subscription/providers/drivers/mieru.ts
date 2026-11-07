import { decodeBase64Bytes } from '../../shared/base64';
import type { MieruNode } from '../types';
import { credentials, host, integer, invalid, oneOf, range, required, uri } from '../uri';

function validateTrafficPattern(value: string): string {
  if (!value || value.length % 4 !== 0 || /[-_]/.test(value)) {
    invalid();
  }

  const bytes = decodeBase64Bytes(value);
  let offset = 0;
  const varint = () => {
    let result = BigInt(0);

    for (let shift = BigInt(0); shift < BigInt(64) && offset < bytes.length; shift += BigInt(7)) {
      const byte = bytes[offset++];

      if (shift === BigInt(63) && byte > 1) {
        invalid();
      }

      result |= BigInt(byte & 127) << shift;
      if (byte < 128) {
        return result;
      }
    }

    return invalid();
  };

  while (offset < bytes.length) {
    const tag = varint();

    if (tag < BigInt(8) || tag > BigInt(0xffffffff)) {
      invalid();
    }

    switch (Number(tag & BigInt(7))) {
      case 0:
        varint();
        break;
      case 1:
        offset += 8;
        break;
      case 2: {
        const length = varint();

        if (length > BigInt(bytes.length - offset)) {
          invalid();
        }

        offset += Number(length);
        break;
      }
      case 5:
        offset += 4;
        break;
      default:
        invalid();
    }
    if (offset > bytes.length) {
      invalid();
    }
  }

  return value;
}

export function parseMieru(body: string): MieruNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  const { username, password } = credentials(required(parsed.rawUser));
  const ports = parsed.params.get('port');
  const protocols = parsed.params.get('protocol');

  if (!ports?.length || protocols?.length !== ports.length) {
    return invalid();
  }

  const bindings = ports.map((value, index) => ({
    ...range(value),
    transport: oneOf(protocols[index], ['TCP', 'UDP']),
  }));
  const singleton = (key: string) => {
    if ((parsed.params.get(key)?.length ?? 0) > 1) {
      invalid();
    }

    return parsed.get(key);
  };
  const profile = required(singleton('profile'));
  const multiplexing = singleton('multiplexing');
  const handshakeMode = singleton('handshake-mode');
  const mtu = singleton('mtu');
  const trafficPattern = singleton('traffic-pattern');
  const known = new Set(['port', 'protocol', 'profile', 'multiplexing', 'handshake-mode', 'traffic-pattern', 'mtu']);

  return {
    protocol: 'mieru',
    name: parsed.name || profile,
    server: host(parsed.authority),
    port: bindings[0].start,
    username: required(username),
    password: required(password),
    mieru: {
      profile,
      bindings,
      multiplexing: multiplexing
        ? oneOf(multiplexing, ['MULTIPLEXING_OFF', 'MULTIPLEXING_LOW', 'MULTIPLEXING_MIDDLE', 'MULTIPLEXING_HIGH'])
        : undefined,
      handshakeMode: handshakeMode ? oneOf(handshakeMode, ['HANDSHAKE_STANDARD', 'HANDSHAKE_NO_WAIT']) : undefined,
      trafficPattern: trafficPattern ? validateTrafficPattern(trafficPattern) : undefined,
      hasUnknownParameters: [...parsed.params.keys()].some((key) => !known.has(key)),
      mtu: mtu === undefined ? undefined : integer(mtu, 1280, 1400),
    },
  };
}
