import 'server-only';
import { appError } from '@/lib/api';
import templates from '@/lib/subconverter/template';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { ParseTemplateConfig, ParseTemplateOutput } from '../model/types';

export async function execute(
  input: string,
  config: ParseTemplateConfig,
  context: ExecutionContext,
): Promise<ParseTemplateOutput> {
  context.signal.throwIfAborted();

  try {
    return templates.parse(input, config.format);
  } catch {
    const failure = appError('workflow.SUBSCRIPTION_TEMPLATE_PARSE_FAILED', { format: config.format });

    throw failure;
  }
}
