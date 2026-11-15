import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { compile as compileSubscription, ConfigCompileError, TemplateError } from '@/lib/sub/compile';
import { COMPILE_TARGETS, isCompileTarget } from '@/lib/sub/shared';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import type { CompileNodeConfig, CompileNodeData } from '../model/types';

export async function compile(
  data: CompileNodeData,
  config: CompileNodeConfig,
  context: ExecutionContext,
): Promise<string> {
  context.signal.throwIfAborted();

  if (!isCompileTarget(config.target)) {
    throw appError('common.INVALID_PARAMS');
  }

  const target = config.target;
  const format = COMPILE_TARGETS[target].format;

  if (format !== 'uri' && data.template && data.template.format !== format) {
    throw appError('workflow.COMPILE_TEMPLATE_MISMATCH');
  }

  try {
    const result = compileSubscription({
      target,
      nodes: data.nodes,
      config: data.config,
      ...(target !== 'mixed' && data.template ? { template: { ...data.template, target } } : {}),
    });

    context.signal.throwIfAborted();

    return result.content;
  } catch (error) {
    context.signal.throwIfAborted();

    if (!(error instanceof ConfigCompileError) && !(error instanceof TemplateError)) {
      throw error;
    }

    logger.warn('Subscription compilation failed', {
      runId: context.runId,
      nodeId: context.nodeId,
      target,
      ...(error instanceof ConfigCompileError ? { index: error.index } : { code: error.code }),
    });

    throw appError(
      error instanceof TemplateError && error.code === 'TEMPLATE_MISMATCH'
        ? 'workflow.COMPILE_TEMPLATE_MISMATCH'
        : 'workflow.COMPILE_FAILED',
    );
  }
}

const service = { compile };

export default service;
