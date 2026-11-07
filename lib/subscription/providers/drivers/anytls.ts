import type { AnyTlsNode } from '../types';
import { endpoint, integer, invalid, named, options, required, tls, uri } from '../uri';

export function parseAnyTls(body: string): AnyTlsNode {
  const parsed = uri(body);

  if (parsed.path) {
    invalid();
  }

  return {
    ...named(parsed, endpoint(parsed.authority, 443)),
    ...options(parsed),
    protocol: 'anytls',
    password: required(decodeURIComponent(required(parsed.rawUser))),
    tls: tls(parsed, true),
    anytls: {
      idleSessionCheckIntervalSeconds: integer(
        parsed.get('idle_session_check_interval', 'idle-session-check-interval') ?? '30',
        1,
        65535,
      ),
      idleSessionTimeoutSeconds: integer(parsed.get('idle_session_timeout', 'idle-session-timeout') ?? '30', 1, 65535),
      minIdleSession: integer(parsed.get('min_idle_session', 'min-idle-session') ?? '0', 0, 65535),
    },
  };
}
