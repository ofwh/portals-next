import { Binary } from 'lucide-react';
import { Base64Form } from './config';
import { defineNodeView } from '../../../core/views';
import { definition } from '../model/definition';
import type { Base64Config } from '../model/types';

export const base64NodeView = defineNodeView<Base64Config>({
  type: definition.type,
  icon: Binary,
  config: { Form: Base64Form },
});
