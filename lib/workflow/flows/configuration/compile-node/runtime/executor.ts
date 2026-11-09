import type { ExecutionContext } from '@/lib/workflow/node/types';
import service from './service';
import type { CompileNodeConfig, CompileNodeData } from '../model/types';

export async function execute(
  data: CompileNodeData,
  config: CompileNodeConfig,
  context: ExecutionContext,
): Promise<string> {
  return service.compile(data, config, context);
}
