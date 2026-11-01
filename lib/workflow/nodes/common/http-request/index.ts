import { defaultConfig, definition } from './definition';
import { execute } from './executor';
import { parseConfig, parseInput } from './parser';
import { configSchema, outputSchema } from './schema';
import type { HttpRequestConfig, HttpRequestOutput } from './types';
import { defineNode } from '../../core/registry';

export const httpRequestNode = defineNode<never, HttpRequestConfig, HttpRequestOutput, null>({
  ...definition,
  input: null,
  output: { schema: outputSchema, multiple: true },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
