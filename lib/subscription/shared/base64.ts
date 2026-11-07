import { Buffer } from 'node:buffer';

export function decodeBase64Bytes(input: string): Buffer {
  const match = /^([A-Za-z0-9+/_-]*)(={0,2})(?![\s\S])/.exec(input);

  if (!match || (/[+/]/.test(input) && /[-_]/.test(input))) {
    throw new Error('INVALID_BASE64');
  }

  const [, body, padding] = match;

  if (body.length % 4 === 1 || (padding && (body.length + padding.length) % 4 !== 0)) {
    throw new Error('INVALID_BASE64');
  }

  const normalized = body.replaceAll('-', '+').replaceAll('_', '/');
  const bytes = Buffer.from(normalized, 'base64');

  if (bytes.toString('base64').replace(/=+$/, '') !== normalized) {
    throw new Error('INVALID_BASE64');
  }

  return bytes;
}

export function decodeBase64(input: string): string {
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(decodeBase64Bytes(input));
}
