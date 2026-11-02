import { Merge } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/nodes/core/views';
import { MergeForm } from './config';
import { definition } from '../model/definition';
import type { MergeConfig } from '../model/types';

export const mergeNodeView = defineNodeView<MergeConfig>({
  type: definition.type,
  icon: Merge,
  config: { Form: MergeForm },
});
