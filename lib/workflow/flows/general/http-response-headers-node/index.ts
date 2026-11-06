import { defineNode } from '@/lib/workflow/node/core/registry';
import { defaultConfig, definition } from './model/definition';
import { configSchema, outputSchema } from './model/schema';
import type { HttpResponseHeadersConfig, HttpResponseHeadersOutput } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';

export const httpResponseHeadersNode = defineNode<never, HttpResponseHeadersConfig, HttpResponseHeadersOutput, null>({
  ...definition,
  input: null,
  output: { schema: outputSchema, multiple: true },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
