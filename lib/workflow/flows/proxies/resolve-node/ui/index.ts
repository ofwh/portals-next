import { List } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { definition } from '../model/definition';
import type { ProxyListConfig } from '../model/types';

export const proxyListNodeView = defineNodeView<ProxyListConfig>({
  type: definition.type,
  icon: List,
  config: { useNodeConfig },
});
