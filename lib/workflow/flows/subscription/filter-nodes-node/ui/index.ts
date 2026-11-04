import { defineNodeView } from '@/lib/workflow/node/core/views';
import { FilterForm } from './config';
import { FilterContent, FilterIcon } from './view';
import { definition } from '../model/definition';
import type { FilterConfig } from '../model/types';

export const filterNodeView = defineNodeView<FilterConfig>({
  type: definition.type,
  icon: FilterIcon,
  config: { Form: FilterForm },
  display: { size: { width: 260, height: 108 }, Content: FilterContent },
});
