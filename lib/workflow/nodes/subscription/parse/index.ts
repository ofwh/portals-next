import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import type { ParseConfig, ParseInput, ParseOutput } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';
import { defineNode } from '../../core/registry';

export const parseNode = defineNode<ParseInput, ParseConfig, ParseOutput, string>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: true },
  configSchema,
  defaultConfig,
  parseConfig,
  parseInput,
  execute,
});
