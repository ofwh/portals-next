import 'server-only';
import { filterService } from './services';
import type { FilterConfig, FilterOutput, FilterRunInput } from './types';
import type { ExecutionContext } from '../../types';

export async function execute(
  input: FilterRunInput,
  config: FilterConfig,
  context: ExecutionContext,
): Promise<FilterOutput> {
  return filterService.filter(input, config, context);
}
