import { decodeBase64 } from '../../shared/base64';
import type { HttpNode, HttpsNode, Socks5Node } from '../types';
import { credentials, endpoint, host, invalid, named, options, port, required, tls, uri } from '../uri';

export function telegramProtocol(scheme: string, body: string): 'socks5' | 'http' | undefined {
  const address = body.split(/[?#]/, 1)[0].toLowerCase();

  if ((scheme === 'https' && address === 't.me/socks') || (scheme === 'tg' && address === 'socks')) {
    return 'socks5';
  }

  if ((scheme === 'https' && address === 't.me/http') || (scheme === 'tg' && address === 'http')) {
    return 'http';
  }
}

export function parseForward(body: string, scheme: string): HttpNode | HttpsNode | Socks5Node | undefined {
  const shared = telegramProtocol(scheme, body);
  const protocol = shared ?? (scheme === 'http' || scheme === 'https' ? scheme : 'socks5');

  if (scheme === 'https' && !shared && /^t\.me(?:[/:?#]|$)/i.test(body)) {
    return;
  }

  const addressPart = body.split(/[?#]/, 1)[0];
  const legacyHttp = !shared && protocol !== 'socks5' && !addressPart.includes('@');
  const parsed = uri(body, legacyHttp);

  if (shared) {
    const address = { server: host(required(parsed.get('server'))), port: port(required(parsed.get('port'))) };

    return {
      ...named(parsed, address),
      ...options(parsed),
      protocol,
      username: parsed.get('user'),
      password: parsed.get('pass'),
    };
  }

  if (parsed.path) {
    return protocol === 'socks5' ? invalid() : undefined;
  }

  let authority = parsed.authority;
  let account = {};

  if (parsed.rawUser !== undefined) {
    const user = parsed.rawUser;

    account = credentials(
      protocol === 'socks5' && !user.includes(':') ? decodeBase64(decodeURIComponent(user)) : user,
      user.includes(':'),
    );
  } else if (protocol !== 'socks5' || (scheme === 'socks' && !authority.includes(':'))) {
    try {
      const decoded = decodeBase64(decodeURIComponent(authority));
      const at = decoded.lastIndexOf('@');

      authority = decoded.slice(at + 1);
      if (at >= 0) {
        account = credentials(decoded.slice(0, at), false);
      }

      endpoint(authority);
    } catch {
      if (protocol === 'socks5' || parsed.get('remarks', 'group') !== undefined) {
        return invalid();
      }

      return;
    }
  }

  const address = endpoint(authority, protocol === 'socks5' ? 1080 : protocol === 'http' ? 80 : 443);

  return {
    ...named(parsed, address),
    ...options(parsed),
    ...account,
    protocol,
    tls: protocol === 'https' ? tls(parsed, true) : undefined,
  };
}
