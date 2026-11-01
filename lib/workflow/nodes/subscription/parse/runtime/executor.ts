import 'server-only';
import { default as parserService } from './service';
import type { ExecutionContext } from '../../../types';
import type { ParseConfig, ParseOutput } from '../model/types';

export async function execute(input: string, config: ParseConfig, context: ExecutionContext): Promise<ParseOutput> {
  context.signal.throwIfAborted();

  return parserService.parseSubscription(input, config.format);
}
