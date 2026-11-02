import { appError } from '@/lib/api';
import { isRecord } from '../../utils';
import type { NodeManifest, TypeDescriptor } from '../types';

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
