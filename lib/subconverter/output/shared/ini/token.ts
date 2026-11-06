import logger from '@/lib/api/logger';
import { fail, OUTPUT_ERROR } from '../errors';

export function token(value: string): string {
  if (/[\r\n\0]/.test(value)) {
    logger.warn(OUTPUT_ERROR.INVALID_INI_LINE_BREAK, { data: value, field: 'text' });

    return fail('assembly', -1, 'text', OUTPUT_ERROR.INVALID_INI_LINE_BREAK);
  }

  return /[,="'()\[\]#;]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
}
