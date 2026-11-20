import type { ConfigDeclaration } from '@/lib/subscription/types';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import configService from './service';
import type { ConfigResolveConfig } from '../model/types';

export async function execute(
  input: string,
  _config: ConfigResolveConfig,
  context: ExecutionContext,
): Promise<ConfigDeclaration[]> {
  return configService.parse(input, context);
}
