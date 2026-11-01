// SPDX-License-Identifier: GPL-3.0-only
// Adapted from victorymt/subconverter-mihomo-worker (50f6719), see ./providers/NOTICE.md.
export function decodeBase64Utf8(value: string): string {
  const normalized = value.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');

  if (!normalized || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    throw new Error('Invalid base64 data');
  }

  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function tryDecodeBase64Utf8(value: string): string | undefined {
  try {
    return decodeBase64Utf8(value);
  } catch {
    return undefined;
  }
}

export function decodeUrlComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseInteger(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isSafeInteger(value)) {
    return value;
  }

  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

export function parseBoolean(value: string | null | undefined): boolean | undefined {
  if (value == null || value === '') {
    return undefined;
  }

  switch (value.toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true;
    case '0':
    case 'false':
    case 'no':
    case 'off':
      return false;
    default:
      return undefined;
  }
}
