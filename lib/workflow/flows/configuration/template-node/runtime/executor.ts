import type { ParsedTemplate } from '@/lib/subscription/types/template';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import service from './service';
import type { TemplateResolveConfig } from '../model/types';

export async function execute(
  input: string,
  config: TemplateResolveConfig,
  context: ExecutionContext,
): Promise<ParsedTemplate> {
  return service.parse(input, config, context);
}
