import 'server-only';
import { default as filterService } from './service';
import type { ExecutionContext } from '../../../types';
import type { FilterConfig, FilterOutput, FilterRunInput } from '../model/types';

export async function execute(
  input: FilterRunInput,
  config: FilterConfig,
  context: ExecutionContext,
): Promise<FilterOutput> {
  return filterService.filter(input, config, context);
}
