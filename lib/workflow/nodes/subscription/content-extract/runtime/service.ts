import 'server-only';
import { appError } from '@/lib/api';
import { providers } from '@/lib/subconverter/providers';
import type { ParsedProxyNode } from '@/lib/types/subscriptions/nodes';
import type { ExecutionContext } from '../../../types';
import { outputSchema } from '../model/schema';
import type { ContentExtractConfig } from '../model/types';

export async function execute(
  content: string,
  config: ContentExtractConfig,
  context: ExecutionContext,
): Promise<ParsedProxyNode[]> {
  context.signal.throwIfAborted();
  try {
    if (!content.trim()) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    const text = content.replace(/^\uFEFF/, '').trim();
    const provider = new providers[config.format]();

    provider.load(text);

    return outputSchema.parse(provider.transform());
  } catch {
    throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
  }
}
