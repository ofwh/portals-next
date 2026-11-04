import { appError } from '@/lib/api';
import type { TypeDescriptor } from '@/lib/types/workflow';
import { policyGroupsSchema } from '@/lib/workflow/flows/configuration/policies-node/model/output-schema';
import { ruleGroupsSchema } from '@/lib/workflow/flows/configuration/rulesets-node/model/output-schema';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { proxyNodesSchema } from '../../schema';
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
    throw appError('workflow.REQUIRED_INPUT');
  }

  if (context.inputSources?.length !== values.length) {
    throw appError('workflow.INVALID_CONNECTION');
  }

  const elements: GenerateSubscriptionElements = {};

  values.forEach((value, index) => {
    const source = context.inputSources![index].type;

    if (sameType(source, proxyNodesSchema.descriptor)) {
      (elements.nodes ??= []).push(...proxyNodesSchema.parse(value));
    } else if (sameType(source, ruleGroupsSchema.descriptor)) {
      (elements.rulesets ??= []).push(...ruleGroupsSchema.parse(value));
    } else if (sameType(source, policyGroupsSchema.descriptor)) {
      (elements.policies ??= []).push(...policyGroupsSchema.parse(value));
    } else {
      throw appError('workflow.INCOMPATIBLE_TYPE');
    }
  });

  return elements;
}
