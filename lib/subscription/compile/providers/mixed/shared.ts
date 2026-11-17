import { Buffer } from 'node:buffer';

export function base64(value: string, url = false): string {
  return Buffer.from(value).toString(url ? 'base64url' : 'base64');
}
