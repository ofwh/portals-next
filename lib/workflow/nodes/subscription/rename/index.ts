import { defaultConfig, definition } from './definition';
import { execute } from './executor';
import { parseConfig, parseInput } from './parser';
import { configSchema, inputSchema, outputSchema } from './schema';
import type { RenameConfig, RenameInput, RenameOutput, RenameRunInput } from './types';
import { defineNode } from '../../core/registry';

export const renameNode = defineNode<RenameInput, RenameConfig, RenameOutput, RenameRunInput>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: { schema: outputSchema, multiple: true },
  configSchema,
  defaultConfig,
  parseConfig,
  parseInput,
  execute,
});
