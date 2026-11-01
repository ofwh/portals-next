import { appError } from '@/lib/api';
import { isRecord } from '../../../../utils';

export function parseJsonObject(text: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(text);

    if (isRecord(value)) {
      return value;
    }
  } catch {
    throw appError('common.INVALID_PARAMS');
  }

  throw appError('common.INVALID_PARAMS');
}
