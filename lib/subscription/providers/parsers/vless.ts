import { xrayOptions, xrayTransport } from './xray';
import type { VlessNode } from '../types';
import { endpoint, invalid, named, options, required, tls, uri, uuid } from '../uri';

export function parseVless(body: string): VlessNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  return {
    ...named(parsed, endpoint(parsed.authority)),
    ...options(parsed),
    protocol: 'vless',
    uuid: uuid(decodeURIComponent(required(parsed.rawUser))),
    encryption: parsed.get('encryption') || 'none',
    flow: parsed.get('flow'),
    packetEncoding: parsed.get('packet-encoding', 'packetEncoding'),
    transport: xrayTransport(parsed),
    tls: tls(parsed, false),
    xray: xrayOptions(parsed.get),
  };
}
