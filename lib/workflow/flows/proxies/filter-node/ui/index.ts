import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { FilterContent, FilterIcon } from './view';
import { definition } from '../model/definition';
import { validateConfig } from '../model/schema';
import type { FilterConfig } from '../model/types';

export const filterNodeView = defineNodeView<FilterConfig>({
  type: definition.type,
  icon: FilterIcon,
  config: { useNodeConfig, validate: validateConfig },
  display: { size: { width: 260, height: 108 }, Content: FilterContent },
});
