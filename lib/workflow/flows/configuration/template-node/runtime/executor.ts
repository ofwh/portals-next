import type { TemplateDocument } from '@/lib/sub/types';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import service from './service';
import type { TemplateResolveConfig } from '../model/types';

export async function execute(
  input: string,
  config: TemplateResolveConfig,
  context: ExecutionContext,
): Promise<TemplateDocument> {
  return service.parse(input, config, context);
}
