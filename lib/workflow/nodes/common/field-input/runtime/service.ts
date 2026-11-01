import 'server-only';
import type { ExecutionContext } from '../../../types';
import { parseJsonObject } from '../model/json';
import type { FieldInputConfig, FieldInputOutput } from '../model/types';

export async function text(config: FieldInputConfig, context: ExecutionContext): Promise<FieldInputOutput> {
  context.signal.throwIfAborted();

  return config.outputFormat === 'JSON' ? parseJsonObject(config.text) : config.text;
}

const service = { text };

export default service;
