import logger from '@/lib/api/logger';
import { parseAnyTls } from './drivers/anytls';
import { parseForward, telegramProtocol } from './drivers/forward';
import { parseHysteria } from './drivers/hysteria';
import { parseHysteria2 } from './drivers/hysteria2';
import { parseMieru } from './drivers/mieru';
import { parseNaive } from './drivers/naive';
import { parseSs } from './drivers/ss';
import { parseSsr } from './drivers/ssr';
import { parseTrojan } from './drivers/trojan';
import { parseTuic } from './drivers/tuic';
import { parseVless } from './drivers/vless';
import { parseVmess } from './drivers/vmess';
import { parseWireGuard } from './drivers/wireguard';
import { transform } from './transform';
import type { ProviderNode } from './types';
import { decodeBase64 } from '../shared/base64';
import { PROVIDER_ERROR_CODES } from '../shared/errors';
import type { ProviderEntryErrorCode, ProviderInputErrorCode } from '../shared/errors';
import type { ProxyNode, ProxyProtocol } from '../types/proxy-node';

type Driver = {
  protocol: ProxyProtocol;
  schemes: readonly string[];
  parse: (body: string, scheme: string) => ProviderNode | undefined;
};

const drivers: Driver[] = [
  { protocol: 'ss', schemes: ['ss'], parse: parseSs },
  { protocol: 'ssr', schemes: ['ssr'], parse: parseSsr },
  { protocol: 'vmess', schemes: ['vmess', 'vmess1'], parse: parseVmess },
  { protocol: 'vless', schemes: ['vless', 'vless1'], parse: parseVless },
  { protocol: 'trojan', schemes: ['trojan', 'trojan-go'], parse: parseTrojan },
  { protocol: 'socks5', schemes: ['socks', 'socks5', 'socks5h'], parse: parseForward },
  { protocol: 'http', schemes: ['http'], parse: parseForward },
  { protocol: 'https', schemes: ['https'], parse: parseForward },
  { protocol: 'hysteria', schemes: ['hysteria', 'hy'], parse: parseHysteria },
  {
    protocol: 'hysteria2',
    schemes: ['hysteria2', 'hy2', 'hysteria2+realm', 'hy2+realm', 'hysteria2+realm+http'],
    parse: parseHysteria2,
  },
  { protocol: 'tuic', schemes: ['tuic'], parse: parseTuic },
  { protocol: 'anytls', schemes: ['anytls'], parse: parseAnyTls },
  { protocol: 'naive', schemes: ['naive+https', 'naive+quic'], parse: parseNaive },
  { protocol: 'wireguard', schemes: ['wireguard'], parse: parseWireGuard },
  { protocol: 'mieru', schemes: ['mierus', 'mieru'], parse: parseMieru },
];

export const proxyProtocols: readonly ProxyProtocol[] = drivers.map(({ protocol }) => protocol);
const byScheme = new Map(drivers.flatMap((driver) => driver.schemes.map((scheme) => [scheme, driver] as const)));

type LineDiagnostic = {
  severity: 'error';
  code: ProviderEntryErrorCode;
  line: number;
  protocol: ProxyProtocol;
};

export type ProviderResult =
  | { ok: true; nodes: ProxyNode[]; diagnostics: LineDiagnostic[] }
  | { ok: false; error: { severity: 'error'; code: ProviderInputErrorCode } };

const maxInputLength = 8 * 1024 * 1024;
const maxLineLength = 64 * 1024;
const maxLines = 100_000;

export function parseProviders(input: string, enabledProtocols: ReadonlySet<ProxyProtocol>): ProviderResult {
  if (input.length > maxInputLength) {
    logger.warn('Provider input exceeds the size limit', {
      code: PROVIDER_ERROR_CODES.INPUT_TOO_LARGE,
      inputLength: input.length,
    });

    return { ok: false, error: { severity: 'error', code: PROVIDER_ERROR_CODES.INPUT_TOO_LARGE } };
  }

  let decoded: string;

  try {
    decoded = decodeBase64(input.trim());
  } catch {
    logger.warn('Provider input is not valid Base64 UTF-8 text', { code: PROVIDER_ERROR_CODES.INVALID_BASE64 });

    return { ok: false, error: { severity: 'error', code: PROVIDER_ERROR_CODES.INVALID_BASE64 } };
  }

  const lines = decoded.split('\n', maxLines + 1);

  if (lines.length > maxLines) {
    logger.warn('Provider input exceeds the line limit', { code: PROVIDER_ERROR_CODES.INPUT_TOO_LARGE, maxLines });

    return { ok: false, error: { severity: 'error', code: PROVIDER_ERROR_CODES.INPUT_TOO_LARGE } };
  }

  const nodes: ProxyNode[] = [];
  const diagnostics: LineDiagnostic[] = [];

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
    const match = /^([a-z][a-z0-9+.-]*):\/\//i.exec(line);

    if (!match) {
      if (line.trim()) {
        logger.info('Provider line filtered', { reason: 'NOT_A_URI', line: index + 1 });
      }

      continue;
    }

    const scheme = match[1].toLowerCase();
    const body = line.slice(match[0].length);
    const telegram = telegramProtocol(scheme, body);
    const driver = byScheme.get(telegram ?? scheme);

    if (!driver || !enabledProtocols.has(driver.protocol)) {
      logger.info('Provider node filtered', {
        reason: driver ? 'PROTOCOL_DISABLED' : 'UNSUPPORTED_SCHEME',
        line: index + 1,
        scheme,
        protocol: driver?.protocol,
      });

      continue;
    }

    if (line.length > maxLineLength) {
      logger.warn('Provider node exceeds the line size limit', {
        code: PROVIDER_ERROR_CODES.LINE_TOO_LARGE,
        protocol: driver.protocol,
        line: index + 1,
      });
      diagnostics.push({
        severity: 'error',
        code: PROVIDER_ERROR_CODES.LINE_TOO_LARGE,
        protocol: driver.protocol,
        line: index + 1,
      });
      continue;
    }

    try {
      const node = driver.parse(body, scheme);

      if (node && enabledProtocols.has(node.protocol)) {
        nodes.push(transform(node));
      } else {
        logger.info('Provider node filtered', {
          reason: node ? 'PROTOCOL_DISABLED' : 'NOT_A_PROXY_NODE',
          line: index + 1,
          scheme,
          protocol: node?.protocol ?? driver.protocol,
        });
      }
    } catch {
      logger.warn('Provider node parsing failed', {
        code: PROVIDER_ERROR_CODES.INVALID_URI,
        protocol: driver.protocol,
        scheme,
        line: index + 1,
      });
      diagnostics.push({
        severity: 'error',
        code: PROVIDER_ERROR_CODES.INVALID_URI,
        protocol: driver.protocol,
        line: index + 1,
      });
    }
  }

  return { ok: true, nodes, diagnostics };
}

export { transform } from './transform';
