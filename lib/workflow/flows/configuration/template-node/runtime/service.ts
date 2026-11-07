import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { isTemplateFormat } from '@/lib/subscription/shared/template';
import templateService from '@/lib/subscription/template';
import type { ParsedTemplate } from '@/lib/subscription/types/template';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { TemplateResolveConfig } from '../model/types';

export function parse(input: string, config: TemplateResolveConfig, context: ExecutionContext): ParsedTemplate {
  context.signal.throwIfAborted();

  if (!isTemplateFormat(config.format)) {
    throw appError('common.INVALID_PARAMS');
  }

  const result = templateService.parse(input, { format: config.format });

  if (!result.ok) {
    logger.warn('Template parsing failed', { runId: context.runId, nodeId: context.nodeId, ...result.error });

    throw appError('workflow.TEMPLATE_PARSE_FAILED', result.error.position);
  }

  context.signal.throwIfAborted();

  return result.template;
}

const service = { parse };

export default service;
