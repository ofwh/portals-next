import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { parseRulesets } from '@/lib/subscription/ruleset';
import { isConfigFormat } from '@/lib/subscription/shared/config';
import type { RuleSet } from '@/lib/subscription/types/ruleset';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { getConfigTransformer } from '../model/schema';
import type { RulesetResolveConfig } from '../model/types';

export function parse(input: string, config: RulesetResolveConfig, context: ExecutionContext): RuleSet[] {
  context.signal.throwIfAborted();

  const transformer = getConfigTransformer(config);

  if (!isConfigFormat(config.format) || !transformer) {
    throw appError('common.INVALID_PARAMS');
  }

  const result = parseRulesets(input, { format: config.format, transformer });

  if (result.ok) {
    for (const diagnostic of result.diagnostics) {
      if (diagnostic.severity === 'warning') {
        logger.warn('Ruleset entry filtered', {
          runId: context.runId,
          nodeId: context.nodeId,
          transformer,
          ...diagnostic,
        });
      }
    }
  }

  const diagnostic = result.ok ? result.diagnostics.find((issue) => issue.severity === 'error') : result.error;

  if (diagnostic) {
    logger.warn('Ruleset parsing failed', {
      runId: context.runId,
      nodeId: context.nodeId,
      ...diagnostic,
    });

    throw appError('workflow.RULESET_PARSE_FAILED', { line: diagnostic.position.line });
  }

  context.signal.throwIfAborted();

  return result.ok ? result.items : [];
}

const service = { parse };

export default service;
