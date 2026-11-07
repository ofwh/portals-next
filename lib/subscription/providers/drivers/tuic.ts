import type { TuicNode } from '../types';
import { credentials, endpoint, flag, integer, invalid, named, oneOf, options, required, tls, uri, uuid } from '../uri';

export function parseTuic(body: string): TuicNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  const user = parsed.rawUser;
  const token = parsed.get('token');
  const account = user?.includes(':') ? credentials(user) : undefined;
  const congestion = parsed.get('congestion_control', 'congestion-controller', 'congestion-control');
  const identity =
    token || !account
      ? { token: required(token || (user === undefined ? undefined : decodeURIComponent(user))) }
      : { uuid: uuid(account.username), password: required(account.password) };

  return {
    ...named(parsed, endpoint(parsed.authority)),
    ...options(parsed),
    ...identity,
    protocol: 'tuic',
    tls: tls(parsed, true),
    tuic: {
      congestionControl: congestion ? oneOf(congestion, ['cubic', 'new_reno', 'bbr']) : undefined,
      udpRelayMode: oneOf(parsed.get('udp_relay_mode', 'udp-relay-mode') || 'native', ['native', 'quic']),
      reduceRtt: flag(parsed.get('zero_rtt_handshake', 'zero-rtt-handshake', 'reduce_rtt', 'reduce-rtt')),
      requestTimeoutMs: integer(parsed.get('request_timeout', 'request-timeout') ?? '15000', 1, 65535),
    },
  };
}
