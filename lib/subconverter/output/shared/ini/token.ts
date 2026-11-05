import { fail } from '../errors';

export function token(value: string): string {
  if (/[\r\n\0]/.test(value)) {
    return fail('assembly', -1, 'text', 'invalid-ini-line-break');
  }

  return /[,="'()\[\]#;]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
}
