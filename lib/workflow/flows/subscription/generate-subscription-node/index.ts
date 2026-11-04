import { defineNode } from '@/lib/workflow/node/core/registry';
import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import type {
  GenerateSubscriptionConfig,
  GenerateSubscriptionElements,
  GenerateSubscriptionInput,
} from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';

export const generateSubscriptionNode = defineNode<
  GenerateSubscriptionInput,
  GenerateSubscriptionConfig,
  string,
  GenerateSubscriptionElements
>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: true },
  output: { schema: outputSchema, multiple: true },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
