import { ipVersion } from '@chainsafe/is-ip';
import type { NodeSource } from '../types';

type Realm = { serverUrl: string; id: string; token: string; stunServers: string[]; uri: string };

export function host(server: string): string {
  return ipVersion(server) === 6 ? `[${server}]` : server;
}

export function pluginOptions(node: Readonly<NodeSource>): Record<string, string> {
  return Object.fromEntries(
    (node.pluginOptions ?? []).map((entry) => {
      const index = entry.indexOf('=');

      return index < 0 ? [entry, ''] : [entry.slice(0, index), entry.slice(index + 1)];
    }),
  );
}

export function mbps(value: string | undefined): number | undefined {
  if (value === undefined) {
    return;
  }

  const text = value
    .trim()
    .replace(/(?: Mbps|Mbps)$/, '')
    .trim();

  return /^\d+$/.test(text) && Number(text) <= 2147483647 ? Number(text) : undefined;
}

export function seconds(value: string | undefined): number | undefined {
  if (value === undefined) {
    return;
  }

  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  if (!/^(?:\d+(?:\.\d+)?(?:ns|us|µs|ms|s|m|h))+$/.test(value)) {
    return;
  }

  const units: Record<string, number> = { ns: 1e-9, us: 1e-6, µs: 1e-6, ms: 1e-3, s: 1, m: 60, h: 3600 };

  return [...value.matchAll(/(\d+(?:\.\d+)?)(ns|us|µs|ms|s|m|h)/g)].reduce(
    (sum, match) => sum + Number(match[1]) * units[match[2]],
    0,
  );
}

export function realm(node: Readonly<NodeSource>): Realm | undefined {
  if (!node.realmUrl) {
    return;
  }

  try {
    const url = new URL(node.realmUrl);

    if (!['realm:', 'realm+http:'].includes(url.protocol)) {
      return;
    }

    const id = decodeURIComponent(url.pathname.slice(1));
    const token = node.realmToken ?? decodeURIComponent(url.username);

    if (!url.hostname || !id || id.includes('/') || !token) {
      return;
    }

    url.username = token;

    return {
      serverUrl: `${url.protocol === 'realm+http:' ? 'http' : 'https'}://${url.host}`,
      id,
      token,
      stunServers: url.searchParams.getAll('stun'),
      uri: url.toString(),
    };
  } catch {
    return;
  }
}
