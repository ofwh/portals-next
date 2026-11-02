import { defaultConfig, definition } from './model/definition';
import { configSchema, outputSchema, outputTypeByConfig } from './model/schema';
import type { FieldInputConfig, FieldInputOutput } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';
import { defineNode } from '../../../core/registry';

export const fieldInputNode = defineNode<never, FieldInputConfig, FieldInputOutput, null>({
  ...definition,
  input: null,
  output: { schema: outputSchema, multiple: true, typeByConfig: outputTypeByConfig },
  configSchema,
  defaultConfig,
  parseConfig,
  parseInput,
  execute,
});
