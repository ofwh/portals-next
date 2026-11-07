import { plugin } from './ss';
import { xrayOptions, xrayTransport } from './xray';
import type { TrojanNode } from '../types';
import { endpoint, flag, invalid, named, options, required, tls, uri } from '../uri';

export function parseTrojan(body: string, scheme: string): TrojanNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  return {
    ...named(parsed, endpoint(parsed.authority, 443)),
    ...options(parsed),
    protocol: 'trojan',
    password: required(decodeURIComponent(required(parsed.rawUser))),
    transport: xrayTransport(parsed, flag(parsed.get('ws')) ? 'ws' : undefined),
    tls: tls(parsed, true),
    xray: xrayOptions(parsed.get),
    trojanGo:
      scheme === 'trojan-go'
        ? { encryption: parsed.get('encryption'), plugin: plugin(parsed.get('plugin')) }
        : undefined,
  };
}
