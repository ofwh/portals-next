import { defaultConfig, definition } from './definition';
import { execute } from './executor';
import { parseConfig, parseInput } from './parser';
import { configSchema, inputSchema, outputSchema } from './schema';
import type { MergeConfig, MergeInput, MergeOutput, MergeRunInput } from './types';
import { defineNode } from '../../core/registry';

export const mergeNode = defineNode<MergeInput, MergeConfig, MergeOutput, MergeRunInput>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: true },
  output: { schema: outputSchema, multiple: true },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
