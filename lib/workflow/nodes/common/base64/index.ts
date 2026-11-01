import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import type { Base64Config, Base64Input, Base64Output } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';
import { defineNode } from '../../core/registry';

export const base64Node = defineNode<Base64Input, Base64Config, Base64Output>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: true },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
