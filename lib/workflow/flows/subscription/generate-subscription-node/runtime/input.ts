import { appError, businessCode, errorMessage } from '@/lib/api';
import logger from '@/lib/api/logger';
import type { TypeDescriptor } from '@/lib/types/workflow';
import { policyGroupsSchema } from '@/lib/workflow/flows/configuration/policies-node/model/output-schema';
import { ruleGroupsSchema } from '@/lib/workflow/flows/configuration/rulesets-node/model/output-schema';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { schema } from '../../schema';
import { configSchema } from '../model/schema';
import type { GenerateSubscriptionElements, GenerateSubscriptionInput } from '../model/types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

function sameType(source: TypeDescriptor, target: TypeDescriptor): boolean {
  if (source.kind === 'union') {
    return source.types.every((type) => sameType(type, target));
  }

  if (source.kind === 'array' && target.kind === 'array') {
    return sameType(source.items, target.items);
  }

  return source.kind === 'ref' && target.kind === 'ref' && source.id === target.id && source.version === target.version;
}

export function parseInput(
  values: readonly GenerateSubscriptionInput[],
  context: ExecutionContext,
): GenerateSubscriptionElements {
  if (!values.length) {
    const failure = appError('workflow.REQUIRED_INPUT');

    logger.warn(errorMessage(failure), {
      code: businessCode(failure.code),
      runId: context.runId,
      nodeId: context.nodeId,
      data: { inputCount: values.length, sourceCount: context.inputSources?.length },
    });

    throw failure;
  }

  if (context.inputSources?.length !== values.length) {
    const failure = appError('workflow.INVALID_CONNECTION');

    logger.warn(errorMessage(failure), {
      code: businessCode(failure.code),
      runId: context.runId,
      nodeId: context.nodeId,
      data: { inputCount: values.length, sourceCount: context.inputSources?.length },
    });

    throw failure;
  }

  const elements: GenerateSubscriptionElements = {};

  values.forEach((value, index) => {
    const source = context.inputSources![index].type;

    if (!Array.isArray(value)) {
      if (elements.template) {
        const failure = appError('workflow.SUBSCRIPTION_TEMPLATE_DUPLICATE');

        logger.warn(errorMessage(failure), {
          code: businessCode(failure.code),
          runId: context.runId,
          nodeId: context.nodeId,
          data: { format: value.format },
          inputNodeId: context.inputSources![index].nodeId,
        });

        throw failure;
      }

      elements.template = schema.template.parse(value);
    } else if (sameType(source, schema.proxyNodes.descriptor)) {
      (elements.nodes ??= []).push(...schema.proxyNodes.parse(value));
    } else if (sameType(source, ruleGroupsSchema.descriptor)) {
      (elements.rulesets ??= []).push(...ruleGroupsSchema.parse(value));
    } else if (sameType(source, policyGroupsSchema.descriptor)) {
      (elements.policies ??= []).push(...policyGroupsSchema.parse(value));
    } else {
      const failure = appError('workflow.INCOMPATIBLE_TYPE');

      logger.warn(errorMessage(failure), {
        code: businessCode(failure.code),
        runId: context.runId,
        nodeId: context.nodeId,
        data: source,
        inputNodeId: context.inputSources![index].nodeId,
      });

      throw failure;
    }
  });

  return elements;
}
