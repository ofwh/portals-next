import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { ConfigParseError, parseConfig } from '@/lib/sub/config';
import type { ConfigDeclaration } from '@/lib/sub/types';
import type { ExecutionContext } from '@/lib/workflow/node/types';

export function parse(input: string, context: ExecutionContext): ConfigDeclaration[] {
  context.signal.throwIfAborted();

  try {
    return parseConfig(input);
  } catch (error) {
    if (!(error instanceof ConfigParseError)) {
      throw error;
    }

    logger.warn('Configuration parsing failed', { runId: context.runId, nodeId: context.nodeId, line: error.line });

    throw appError('workflow.CONFIG_PARSE_FAILED', { line: error.line });
  }
}

const service = { parse };

export default service;
