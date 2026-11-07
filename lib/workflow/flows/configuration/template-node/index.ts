import { defineNode } from '@/lib/workflow/node/core/registry';
import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';

export const templateResolveNode = defineNode({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: false },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
