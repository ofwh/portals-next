import 'server-only';
import type { ExecutionContext } from '../../../types';
import type { TextareaConfig, TextareaOutput } from '../types';
import { parseJsonObject } from '../utils';

export async function text(config: TextareaConfig, context: ExecutionContext): Promise<TextareaOutput> {
  context.signal.throwIfAborted();

  return config.outputFormat === 'JSON' ? parseJsonObject(config.text) : config.text;
}

const service = { text };

export default service;
