import { Merge } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/nodes/core/views';
import { definition } from '../model/definition';
import type { MergeConfig } from '../model/types';

export const mergeNodeView = defineNodeView<MergeConfig>({
  type: definition.type,
  icon: Merge,
});
