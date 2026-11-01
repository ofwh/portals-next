import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import { parseConfig, parseInput } from './runtime/input';
import { execute } from './runtime/service';
import { defineNode } from '../../core/registry';

export const contentExtractNode = defineNode({
  ...definition,
  defaultConfig,
  configSchema,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: true },
  parseConfig,
  parseInput,
  execute,
});
