import { defaultConfig, definition } from './definition';
import { execute } from './executor';
import { parseConfig, parseInput } from './parser';
import { configSchema, outputSchema } from './schema';
import type { TextareaConfig, TextareaOutput } from './types';
import { defineNode } from '../../core/registry';

export const textareaNode = defineNode<never, TextareaConfig, TextareaOutput, null>({
  ...definition,
  input: null,
  output: { schema: outputSchema, multiple: true },
  configSchema,
  defaultConfig,
  parseConfig,
  parseInput,
  execute,
});
