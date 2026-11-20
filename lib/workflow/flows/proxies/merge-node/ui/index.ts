import { Merge } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { definition } from '../model/definition';
import type { MergeConfig } from '../model/types';

export const mergeNodeView = defineNodeView<MergeConfig>({
  type: definition.type,
  icon: Merge,
  config: { useNodeConfig },
});
