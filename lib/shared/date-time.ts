import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const DEFAULT_TIME_FORMAT = 'yyyy/MM/dd HH:mm:ss';
export const TIME_FORMATS = [
  DEFAULT_TIME_FORMAT,
  'yyyy-MM-dd HH:mm:ss',
  'yyyy/MM/dd HH:mm',
  'yyyy-MM-dd HH:mm',
  'yyyy/MM/dd',
  'yyyy-MM-dd',
  'MM/dd/yyyy hh:mm:ss A',
  'dd/MM/yyyy HH:mm:ss',
];

export function formatDateTime(
  value: string | number | Date | null | undefined,
  pattern = DEFAULT_TIME_FORMAT,
  options: { utc?: boolean } = {},
): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const date = options.utc ? dayjs.utc(value) : dayjs(value);
  const tokens: Record<string, string> = { yyyy: 'YYYY', yy: 'YY', dd: 'DD', d: 'D' };
  const format = pattern.replace(/\[[^\]]*\]|'[^']*'|yyyy|yy|d{1,4}/g, (token) => {
    if (token.startsWith("'")) {
      return `[${token.slice(1, -1)}]`;
    }

    return tokens[token] ?? token;
  });

  return date.isValid() ? date.format(format) : '—';
}
