import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { parsePolicies } from '@/lib/subscription/policy';
import { isPolicyTransformer } from '@/lib/subscription/policy/transformers';
import { isConfigFormat } from '@/lib/subscription/shared/config';
import type { ProxyGroup } from '@/lib/subscription/types/policy';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { PolicyResolveConfig } from '../model/types';

export function parse(input: string, config: PolicyResolveConfig, context: ExecutionContext): ProxyGroup[] {
  context.signal.throwIfAborted();

  if (!isConfigFormat(config.format) || !isPolicyTransformer(config.transformer)) {
    throw appError('common.INVALID_PARAMS');
  }

  const result = parsePolicies(input, { format: config.format, transformer: config.transformer });

  if (result.ok) {
    for (const diagnostic of result.diagnostics) {
      if (diagnostic.severity === 'warning') {
        logger.warn('Policy entry filtered', {
          runId: context.runId,
          nodeId: context.nodeId,
          transformer: config.transformer,
          ...diagnostic,
        });
      }
    }
  }

  const diagnostic = result.ok ? result.diagnostics.find((issue) => issue.severity === 'error') : result.error;

  if (diagnostic) {
    logger.warn('Policy parsing failed', {
      runId: context.runId,
      nodeId: context.nodeId,
      ...diagnostic,
    });

    throw appError('workflow.POLICY_PARSE_FAILED', { line: diagnostic.position.line });
  }

  context.signal.throwIfAborted();

  return result.ok ? result.items : [];
}

const service = { parse };

export default service;
