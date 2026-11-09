import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import compileService from '@/lib/subscription/compile';
import { compileTargets, isCompileTarget } from '@/lib/subscription/shared/compile';
import type { ParsedTemplate } from '@/lib/subscription/types/template';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { resolve } from './resources';
import type { CompileNodeConfig, CompileNodeData } from '../model/types';

function emptyTemplate(format: 'yaml' | 'json' | 'ini'): ParsedTemplate {
  return format === 'ini' ? { format, value: { sections: [] } } : { format, value: {} };
}

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
  const format = compileTargets[target].format;

  if (format !== 'uri' && data.template && data.template.format !== format) {
    throw appError('workflow.COMPILE_TEMPLATE_MISMATCH');
  }

  const resources = await resolve(target, data.rulesets, context);

  context.signal.throwIfAborted();
  const result = compileService.compile({
    ...data,
    target,
    ...(format !== 'uri' ? { template: data.template ?? emptyTemplate(format) } : {}),
    resources,
  });

  for (const diagnostic of result.diagnostics) {
    logger.warn('Compilation entry filtered', { runId: context.runId, nodeId: context.nodeId, ...diagnostic });
  }
  if (!result.ok) {
    logger.warn('Subscription compilation failed', { runId: context.runId, nodeId: context.nodeId, ...result.error });

    throw appError('workflow.COMPILE_FAILED');
  }

  context.signal.throwIfAborted();

  return result.content;
}

const service = { compile };

export default service;
