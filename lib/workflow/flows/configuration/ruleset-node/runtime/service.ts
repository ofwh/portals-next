import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { parseRulesets } from '@/lib/subscription/ruleset';
import { getRulesetResolver, isRulesetFormat } from '@/lib/subscription/shared/ruleset';
import type { RuleSet } from '@/lib/subscription/types/ruleset';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { RulesetResolveConfig } from '../model/types';

export function parse(input: string, config: RulesetResolveConfig, context: ExecutionContext): RuleSet[] {
  context.signal.throwIfAborted();

  const resolver = getRulesetResolver(config.resolver);

  if (!isRulesetFormat(config.format) || !resolver) {
    throw appError('common.INVALID_PARAMS');
  }

  const result = parseRulesets(input, { format: config.format, resolver });

  if (result.ok) {
    for (const diagnostic of result.diagnostics) {
      if (diagnostic.severity === 'warning') {
        logger.warn('Ruleset entry filtered', {
          runId: context.runId,
          nodeId: context.nodeId,
          resolver,
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
