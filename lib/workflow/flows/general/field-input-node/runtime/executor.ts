import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { default as textService } from './service';
import type { FieldInputConfig, FieldInputOutput } from '../model/types';

export async function execute(
  _input: null,
  config: FieldInputConfig,
  context: ExecutionContext,
): Promise<FieldInputOutput> {
  return textService.text(config, context);
}
