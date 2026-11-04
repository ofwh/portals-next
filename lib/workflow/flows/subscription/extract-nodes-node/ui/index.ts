import { defineNodeView } from '@/lib/workflow/node/core/views';
import { ExtractNodesForm } from './config';
import { ExtractNodesContent, ExtractNodesIcon } from './view';
import { definition } from '../model/definition';
import type { ExtractNodesConfig } from '../model/types';

export const extractNodesNodeView = defineNodeView<ExtractNodesConfig>({
  type: definition.type,
  icon: ExtractNodesIcon,
  config: { Form: ExtractNodesForm },
  display: { size: { width: 260, height: 108 }, Content: ExtractNodesContent },
});
