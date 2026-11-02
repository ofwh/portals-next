import { Binary } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/nodes/core/views';
import { Base64Form } from './config';
import { definition } from '../model/definition';
import type { Base64Config } from '../model/types';

export const base64NodeView = defineNodeView<Base64Config>({
  type: definition.type,
  icon: Binary,
  config: { Form: Base64Form },
});
