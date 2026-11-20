import type { ProxyNode } from '../../types';

type Realm = { serverUrl: string; id: string; token: string; stunServers: string[]; uri: string };

export function realm(node: Readonly<ProxyNode>): Realm | undefined {
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
