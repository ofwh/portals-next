import { defineNode } from '@/lib/workflow/node/core/registry';
import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import type { RuleGroupsConfig, RuleGroupsInput, RuleGroupsOutput } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';

export const ruleGroupsNode = defineNode<RuleGroupsInput, RuleGroupsConfig, RuleGroupsOutput>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: true },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
