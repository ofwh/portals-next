import { FileCode } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { definition } from '../model/definition';
import { validateConfig } from '../model/schema';
import type { TemplateResolveConfig } from '../model/types';

export const templateResolveNodeView = defineNodeView<TemplateResolveConfig>({
  type: definition.type,
  icon: FileCode,
  config: { useNodeConfig, validate: validateConfig },
});
