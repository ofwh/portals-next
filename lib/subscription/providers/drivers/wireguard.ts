import { isIP } from 'node:net';
import type { WireGuardNode } from '../types';
import { endpoint, flag, integer, invalid, list, named, options, required, splitAt, uri } from '../uri';

function cidr(value: string) {
  const [address, prefix] = splitAt(value.trim(), '/');
  const family = isIP(address);

  if (!family) {
    invalid();
  }

  const max = family === 4 ? 32 : 128;

  return `${address}/${prefix === undefined ? max : integer(prefix, 0, max)}`;
}

export function parseWireGuard(body: string): WireGuardNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  const { server, port } = endpoint(parsed.authority);
  const number = (key: string, min: number) => {
    const value = parsed.get(key);

    return value === undefined ? undefined : integer(value, min, 65535);
  };
  const reserved = parsed
    .get('reserved')
    ?.replace(/^\[|\]$/g, '')
    .split(/[,/]/)
    .map((value) => integer(value.trim(), 0, 255));

  if (reserved && reserved.length !== 3) {
    invalid();
  }

  return {
    ...named(parsed, { server, port }),
    ...options(parsed),
    protocol: 'wireguard',
    wireguard: {
      privateKey: required(decodeURIComponent(required(parsed.rawUser))),
      addresses: required(parsed.get('address')).split(',').map(cidr),
      dns: list(parsed.get('dns')),
      mtu: number('mtu', 1),
      interfaceName: parsed.get('interface-name'),
      system: flag(parsed.get('system')),
      listenPort: number('listen-port', 0),
      workers: number('workers', 1),
      peers: [
        {
          endpoint: { server, port },
          publicKey: required(parsed.get('publickey', 'public-key')),
          preSharedKey: parsed.get('presharedkey', 'pre-shared-key'),
          allowedIPs: list(parsed.get('allowed-ips'))?.map(cidr),
          reserved,
          keepAlive: number('keepalive', 0),
        },
      ],
    },
  };
}
