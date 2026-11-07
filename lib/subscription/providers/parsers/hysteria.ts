import type { HysteriaNode, PortRange } from '../types';
import { endpoint, invalid, named, oneOf, options, range, type ShareUri, tls, uri } from '../uri';

export function bandwidth(value: string | undefined, bareMbps = false) {
  if (value === undefined) {
    return;
  }

  const match = /^(\d+(?:\.\d+)?)\s*([kmgt]?(?:bps|bit\/s))?$/i.exec(value.trim());

  if (!match || !Number.isFinite(Number(match[1])) || Number(match[1]) <= 0) {
    return invalid();
  }

  return match[2] ? `${match[1]} ${match[2].toLowerCase()}` : bareMbps ? `${match[1]} Mbps` : invalid();
}

export function hopping(parsed: ShareUri, address: { ports: PortRange[] }, bareMbps: boolean) {
  const extra = parsed.get('ports', 'mport');
  const ports = [...address.ports, ...(extra ? extra.split(',').map(range) : [])];
  const hopInterval = parsed.get('hopInterval', 'hop_interval', 'hop-interval');

  if (hopInterval !== undefined && !/^(?:[1-9]\d*(?:ns|us|ms|s|m|h))+$/.test(hopInterval)) {
    invalid();
  }

  return {
    ports: [...new Map(ports.map((item) => [`${item.start}-${item.end}`, item])).values()],
    up: bandwidth(parsed.get('upmbps', 'up_mbps', 'up'), bareMbps),
    down: bandwidth(parsed.get('downmbps', 'down_mbps', 'down'), bareMbps),
    hopInterval,
  };
}

export function parseHysteria(body: string): HysteriaNode {
  const parsed = uri(body);

  if (parsed.rawUser !== undefined || parsed.path) {
    invalid();
  }

  const address = endpoint(parsed.authority, undefined, true);
  const obfs = parsed.get('obfs');

  return {
    ...named(parsed, address),
    ...options(parsed),
    protocol: 'hysteria',
    tls: tls(parsed, true),
    hysteria: {
      ...hopping(parsed, address, true),
      network: oneOf(parsed.get('protocol') || 'udp', ['udp', 'wechat-video', 'faketcp']),
      auth: parsed.get('auth_str', 'auth-str', 'auth'),
      obfs: obfs ? oneOf(obfs, ['xplus']) : undefined,
      obfsPassword: parsed.get('obfsParam', 'obfs-param'),
    },
  };
}
