import { isIP } from 'node:net';
import { userAgentFromString } from 'next/server';
import 'server-only';

const CLIENT_IP_HEADERS = [
  'cf-connecting-ip',
  'true-client-ip',
  'fastly-client-ip',
  'x-real-ip',
  'x-forwarded-for',
  'forwarded',
  'x-client-ip',
  'x-cluster-client-ip',
] as const;

export function parseUa(ua: string | null | undefined) {
  const result: { ua: string | null; os: string | null; device: string | null; browser: string | null } = {
    ua: ua?.trim() ? ua : null,
    os: null,
    device: null,
    browser: null,
  };

  if (!result.ua) {
    return result;
  }

  try {
    const parsed = userAgentFromString(result.ua);

    result.os = parsed.os.name || null;
    result.device = parsed.device.type || null;
    result.browser = parsed.browser.name || null;
  } catch {
    return result;
  }

  return result;
}

export function normalizeIp(input: string | null | undefined): string | null {
  const ip = input?.trim();

  if (!ip || ip.includes('%')) {
    return null;
  }

  const version = isIP(ip);

  if (version === 4) {
    return ip;
  }

  return version === 6 ? new URL(`http://[${ip}]/`).hostname.slice(1, -1) : null;
}

function address(value: string): string | null {
  const candidate = value.trim().replace(/^"(.*)"$/, '$1');
  const ip = normalizeIp(candidate);

  if (ip) {
    return ip;
  }

  const withPort = candidate.match(/^\[([^\]]+)\](?::\d+)?$/) ?? candidate.match(/^([^:]+):\d+$/);

  return withPort ? normalizeIp(withPort[1]) : null;
}

export function resolveIp(headers: Headers): string | null {
  for (const name of CLIENT_IP_HEADERS) {
    const value = headers.get(name);

    if (!value) {
      continue;
    }

    for (const entry of value.split(',')) {
      const candidate = name === 'forwarded' ? entry.match(/(?:^|;)\s*for\s*=\s*("[^"]*"|[^;\s]+)/i)?.[1] : entry;
      const ip = candidate ? address(candidate) : null;

      if (ip) {
        return ip;
      }
    }
  }

  return null;
}
