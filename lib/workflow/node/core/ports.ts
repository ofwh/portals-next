import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import type { TypeDescriptor } from '@/lib/types/workflow';
import type { NodeManifest } from '../types';

export function resolveOutputType(output: NonNullable<NodeManifest['output']>, config: unknown): TypeDescriptor {
  const selection = output.typeByConfig;

  if (!selection) {
    return output.type;
  }

  const value = isRecord(config) ? config[selection.field] : undefined;

  if (typeof value !== 'string' || !Object.hasOwn(selection.types, value)) {
    throw appError('common.INVALID_PARAMS');
  }

  return selection.types[value];
}
