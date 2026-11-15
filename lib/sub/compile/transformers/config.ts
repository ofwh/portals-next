import logger from '@/lib/api/logger';
import type { ConfigDeclaration } from '../../types';
import { providers } from '../providers';
import { ConfigCompileError } from '../shared/config';
import type { CompiledConfig, CompiledNode, TemplateTarget } from '../types';

export function compileConfig(
  config: readonly ConfigDeclaration[],
  target: TemplateTarget,
  nodes: readonly CompiledNode[] = [],
): CompiledConfig {
  if (!Object.hasOwn(providers, target)) {
    logger.info(`Unsupported subscription target "${target}"`);

    throw new ConfigCompileError(target, 'Unsupported output target');
  }

  return providers[target].compileConfig(config, nodes);
}
