import { FileSliders } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { definition } from '../model/definition';
import type { ConfigResolveConfig } from '../model/types';

export const configResolveNodeView = defineNodeView<ConfigResolveConfig>({
  type: definition.type,
  icon: FileSliders,
  config: { useNodeConfig },
});
