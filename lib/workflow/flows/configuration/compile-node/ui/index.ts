import { FileOutput } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { definition } from '../model/definition';
import { validateConfig } from '../model/schema';
import type { CompileNodeConfig } from '../model/types';

export const compileNodeView = defineNodeView<CompileNodeConfig>({
  type: definition.type,
  icon: FileOutput,
  config: { useNodeConfig, validate: validateConfig },
});
