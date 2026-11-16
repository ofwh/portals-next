import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { RouteContent, RouteIcon } from './view';
import { definition } from '../model/definition';
import type { RouteConfig } from '../model/types';

export const routeNodeView = defineNodeView<RouteConfig>({
  type: definition.type,
  icon: RouteIcon,
  config: { useNodeConfig, className: 'sm:max-w-[720px]' },
  display: { size: { width: 260, height: 132 }, Content: RouteContent },
});
