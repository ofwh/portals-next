import { Buffer } from 'node:buffer';
import 'server-only';
import { appError } from '@/lib/api';
import type { ExecutionContext } from '../../../types';
import type { Base64Config, Base64Input, Base64Output } from '../model/types';

export async function convert(
  input: Base64Input,
  config: Base64Config,
  context: ExecutionContext,
): Promise<Base64Output> {
  context.signal.throwIfAborted();

  if (config.mode === 'encode') {
    return Buffer.from(input, 'utf8').toString('base64');
  }

  try {
    const binary = atob(input);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  } catch {
    throw appError('common.INVALID_PARAMS');
  }
}

const service = { convert };

export default service;
