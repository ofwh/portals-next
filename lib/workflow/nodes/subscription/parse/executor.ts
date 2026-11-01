import 'server-only';
import { parserService } from './services';
import type { ParseConfig, ParseOutput } from './types';
import type { ExecutionContext } from '../../types';

export async function execute(input: string, config: ParseConfig, context: ExecutionContext): Promise<ParseOutput> {
  context.signal.throwIfAborted();

  return parserService.parseSubscription(input, config.format);
}
