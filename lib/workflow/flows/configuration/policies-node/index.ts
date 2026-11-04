import { defineNode } from '@/lib/workflow/node/core/registry';
import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import type { PolicyGroupsConfig, PolicyGroupsInput, PolicyGroupsOutput } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';

export const policyGroupsNode = defineNode<PolicyGroupsInput, PolicyGroupsConfig, PolicyGroupsOutput>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: true },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
