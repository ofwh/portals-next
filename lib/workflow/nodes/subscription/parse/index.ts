import { defaultConfig, definition } from './definition';
import { execute } from './executor';
import { parseConfig, parseInput } from './parser';
import { configSchema, inputSchema, outputSchema } from './schema';
import type { ParseConfig, ParseInput, ParseOutput } from './types';
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
