import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { isTemplateFormat } from '@/lib/sub/shared';
import { parseTemplate, TemplateParseError } from '@/lib/sub/template';
import type { TemplateDocument } from '@/lib/sub/types';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { TemplateResolveConfig } from '../model/types';

export function parse(input: string, config: TemplateResolveConfig, context: ExecutionContext): TemplateDocument {
  context.signal.throwIfAborted();

  if (!isTemplateFormat(config.format)) {
    throw appError('common.INVALID_PARAMS');
  }

  try {
    const template = parseTemplate(input, config.format);

    context.signal.throwIfAborted();

    return template;
  } catch (error) {
    context.signal.throwIfAborted();

    if (!(error instanceof TemplateParseError)) {
      throw error;
    }

    logger.warn('Template parsing failed', {
      runId: context.runId,
      nodeId: context.nodeId,
      code: error.code,
      position: error.position,
    });

    throw appError('workflow.TEMPLATE_PARSE_FAILED', error.position);
  }
}

const service = { parse };

export default service;
