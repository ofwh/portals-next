import type { NaiveNode } from '../types';
import { credentials, endpoint, flag, integer, invalid, named, options, required, tls, uri } from '../uri';

export function parseNaive(body: string, scheme: string): NaiveNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  const user = required(parsed.rawUser);
  const account = user.includes(':') ? credentials(user) : { password: decodeURIComponent(user) };
  const concurrency = parsed.get('insecure-concurrency');

  return {
    ...named(parsed, endpoint(parsed.authority, 443)),
    ...options(parsed),
    ...account,
    password: required(account.password),
    protocol: 'naive',
    tls: tls(parsed, true),
    naive: {
      transport: scheme === 'naive+quic' ? 'quic' : 'https',
      insecureConcurrency: concurrency === undefined ? undefined : integer(concurrency, 1, 0xffffffff),
      uot: flag(parsed.get('uot')),
    },
  };
}
