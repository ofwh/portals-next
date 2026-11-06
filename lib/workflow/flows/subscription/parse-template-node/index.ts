import { defineNode } from '@/lib/workflow/node/core/registry';
import { defaultConfig, definition } from './model/definition';
import { configSchema, inputSchema, outputSchema } from './model/schema';
import type { ParseTemplateConfig, ParseTemplateInput, ParseTemplateOutput } from './model/types';
import { execute } from './runtime/executor';
import { parseConfig, parseInput } from './runtime/input';
import { schema } from '../schema';

export const parseTemplateNode = defineNode<ParseTemplateInput, ParseTemplateConfig, ParseTemplateOutput, string>({
  ...definition,
  input: { schema: inputSchema, required: true, multiple: false },
  output: {
    schema: outputSchema,
    multiple: false,
    typeByConfig: { field: 'format', types: schema.templateTypesByFormat },
  },
  defaultConfig,
  configSchema,
  parseConfig,
  parseInput,
  execute,
});
