import { defaultConfig, definition } from './definition';
import { execute } from './executor';
import { parseConfig, parseInput } from './parser';
import { configSchema, inputSchema, outputSchema } from './schema';
import type { FilterConfig, FilterInput, FilterOutput, FilterRunInput } from './types';
import { defineNode } from '../../core/registry';

export const filterNode = defineNode<FilterInput, FilterConfig, FilterOutput, FilterRunInput>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: true },
  configSchema,
  defaultConfig,
  parseConfig,
  parseInput,
  execute,
});
