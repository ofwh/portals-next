import { CompileError } from '../diagnostics';

export function loonValue(value: string, quote = false): string {
  if (/[\r\n]/.test(value)) {
    throw new CompileError('INVALID_INPUT');
  }

  return quote || /[,"\s]/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
}
