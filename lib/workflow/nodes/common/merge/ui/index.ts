import { Merge } from 'lucide-react';
import { MergeForm } from './config';
import { defineNodeView } from '../../../core/views';
import { definition } from '../model/definition';
import type { MergeConfig } from '../model/types';

export const mergeNodeView = defineNodeView<MergeConfig>({
  type: definition.type,
  icon: Merge,
  config: { Form: MergeForm },
});
