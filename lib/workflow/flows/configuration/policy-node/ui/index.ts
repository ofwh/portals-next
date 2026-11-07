import { ListTree } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { definition } from '../model/definition';
import { validateConfig } from '../model/schema';
import type { PolicyResolveConfig } from '../model/types';

export const policyResolveNodeView = defineNodeView<PolicyResolveConfig>({
  type: definition.type,
  icon: ListTree,
  config: { useNodeConfig, validate: validateConfig },
});
