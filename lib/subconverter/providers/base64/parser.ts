import type { Base64Config } from '../../types/providers/base64';
import { parseIni } from '../ini/parser';
import { base64 } from '../schema';
import { parse as parseUri } from '../uri/parser';

export function parse(content: string): Base64Config {
  const decoded = base64(content.trim());

  if (
    /^\s*\[(?:Proxy|server_local)\]/im.test(decoded) ||
    /^\s*(?:vmess|vless|shadowsocks|hysteria2|anytls|http|trojan)\s*=/im.test(decoded)
  ) {
    return parseIni(decoded);
  }

  return parseUri(decoded);
}
