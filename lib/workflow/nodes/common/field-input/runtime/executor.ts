import 'server-only';
import { default as textService } from './service';
import type { ExecutionContext } from '../../../types';
import type { FieldInputConfig, FieldInputOutput } from '../model/types';

export async function execute(
  _input: null,
  config: FieldInputConfig,
  context: ExecutionContext,
): Promise<FieldInputOutput> {
  return textService.text(config, context);
}
