import 'server-only';
import { appError } from '@/lib/api';
import logger from '@/lib/api/logger';
import { getRequestId } from '@/lib/api/request-context';
import { request } from '@/lib/shared/http';
import { ruleDelivery } from '@/lib/subscription/shared/compile';
import { textLimits } from '@/lib/subscription/shared/text';
import type { CompileTarget } from '@/lib/subscription/types/compile';
import type { RuleSet } from '@/lib/subscription/types/ruleset';
import type { ExecutionContext } from '@/lib/workflow/node/types';

async function read(address: string, context: ExecutionContext): Promise<string> {
  const url = new URL(address);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw appError('workflow.COMPILE_RESOURCE_FAILED');
  }

  const response = await request(url.href, {
    requestId: getRequestId(),
    cache: 'no-store',
    signal: AbortSignal.any([context.signal, AbortSignal.timeout(30000)]),
  });

  if (!response.ok) {
    await response.body?.cancel();

    throw appError('workflow.COMPILE_RESOURCE_FAILED');
  }

  if (!response.body) {
    return '';
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      length += value.byteLength;
      if (length > textLimits.length) {
        throw appError('workflow.COMPILE_RESOURCE_FAILED');
      }

      result += decoder.decode(value, { stream: true });
    }

    return result + decoder.decode();
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export async function resolve(
  target: CompileTarget,
  rulesets: readonly RuleSet[],
  context: ExecutionContext,
): Promise<Record<string, string>> {
  const resources: Record<string, string> = {};

  if (
    target !== 'singbox' &&
    !['mixed', 'v2rayn', 'v2rayng'].includes(target) &&
    rulesets.some((ruleset) => ruleset.category === 'singbox')
  ) {
    throw appError('workflow.COMPILE_FAILED');
  }

  for (const [index, ruleset] of rulesets.entries()) {
    if (ruleset.source.kind !== 'resource' || ruleDelivery(target, ruleset) !== 'expand') {
      continue;
    }

    const address = ruleset.source.address;

    if (Object.hasOwn(resources, address)) {
      continue;
    }

    context.signal.throwIfAborted();
    try {
      resources[address] = await read(address, context);
    } catch {
      context.signal.throwIfAborted();
      logger.warn('Compilation rule resource loading failed', {
        runId: context.runId,
        nodeId: context.nodeId,
        target,
        index,
      });

      throw appError('workflow.COMPILE_RESOURCE_FAILED');
    }
  }

  return resources;
}
