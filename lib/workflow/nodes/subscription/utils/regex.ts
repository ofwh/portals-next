import { appError } from '@/lib/api';

export function compilePattern(pattern: string, flags = ''): RegExp {
  try {
    let source = pattern;
    let suppliedFlags = '';
    const closing = pattern.lastIndexOf('/');
    let escapes = 0;

    for (let i = closing - 1; i >= 0 && pattern[i] === '\\'; i--) {
      escapes++;
    }
    if (pattern.startsWith('/') && closing > 0 && escapes % 2 === 0 && /^[a-z]*$/i.test(pattern.slice(closing + 1))) {
      source = pattern.slice(1, closing);
      suppliedFlags = pattern.slice(closing + 1);
    }

    const regex = new RegExp(source, suppliedFlags);

    return new RegExp(regex.source, [...new Set(flags + regex.flags)].join(''));
  } catch {
    throw appError('common.INVALID_PARAMS');
  }
}
