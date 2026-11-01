import 'server-only';
import { textService } from './services';
import type { TextareaConfig, TextareaOutput } from './types';
import type { ExecutionContext } from '../../types';

export async function execute(
  _input: null,
  config: TextareaConfig,
  context: ExecutionContext,
): Promise<TextareaOutput> {
  return textService.text(config, context);
}
