import { ListFilter } from 'lucide-react';
import { ContentExtractForm } from './config';
import { defineNodeView } from '../../../core/views';
import { definition } from '../model/definition';
import type { ContentExtractConfig } from '../model/types';

export const contentExtractNodeView = defineNodeView<ContentExtractConfig>({
  type: definition.type,
  icon: ListFilter,
  config: { Form: ContentExtractForm },
});
