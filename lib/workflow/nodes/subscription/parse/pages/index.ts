import { ParseForm } from './config';
import { ParseContent, ParseIcon } from './view';
import { defineNodeView } from '../../../core/views';
import { definition } from '../definition';
import type { ParseConfig } from '../types';

export const parseNodeView = defineNodeView<ParseConfig>({
  type: definition.type,
  icon: ParseIcon,
  config: { Form: ParseForm },
  display: { size: { width: 260, height: 108 }, Content: ParseContent },
});
