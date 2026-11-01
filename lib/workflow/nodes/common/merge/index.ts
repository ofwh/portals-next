import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import type { MergeConfig, MergeInput, MergeOutput, MergeRunInput } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';
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
