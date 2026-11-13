import type { SnellNode } from '../types';
import { endpoint, flag, integer, invalid, named, oneOf, options, required, uri } from '../uri';

export function parseSnell(body: string): SnellNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  const version = parsed.get('version');
  const udpPort = parsed.get('udp-port');
  const mode = parsed.get('mode');
  const shadowTlsVersion = parsed.get('shadow-tls-version');
  const reuse = parsed.get('reuse');

  return {
    ...named(parsed, endpoint(parsed.authority)),
    ...options(parsed),
    protocol: 'snell',
    password: required(decodeURIComponent(required(parsed.rawUser))),
    snell: {
      snellVersion: version === undefined ? undefined : integer(version, 1, 6),
      snellReuse: reuse === undefined ? undefined : flag(reuse),
      snellUdpPort: udpPort === undefined ? undefined : integer(udpPort, 1, 65535),
      snellMode: mode === undefined ? undefined : oneOf(mode, ['default', 'unshaped', 'unsafe-raw']),
      shadowTlsPassword: parsed.get('shadow-tls-password'),
      shadowTlsSni: parsed.get('shadow-tls-sni'),
      shadowTlsVersion: shadowTlsVersion === undefined ? undefined : integer(shadowTlsVersion, 2, 3),
      obfs: parsed.get('obfs'),
      host: parsed.get('obfs-host'),
      path: parsed.get('obfs-uri'),
    },
  };
}
