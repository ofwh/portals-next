import 'server-only';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import parsing from '../../runtime/parsing';
import type { ExtractNodesConfig, ExtractNodesOutput } from '../model/types';

export async function execute(
  input: string,
  config: ExtractNodesConfig,
  context: ExecutionContext,
): Promise<ExtractNodesOutput> {
  context.signal.throwIfAborted();

  return parsing.parse(input, config.format);
}
