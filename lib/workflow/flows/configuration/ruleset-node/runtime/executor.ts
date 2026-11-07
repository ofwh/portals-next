import type { RuleSet } from '@/lib/subscription/types/ruleset';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import service from './service';
import type { RulesetResolveConfig } from '../model/types';

export async function execute(
  input: string,
  config: RulesetResolveConfig,
  context: ExecutionContext,
): Promise<RuleSet[]> {
  return service.parse(input, config, context);
}
