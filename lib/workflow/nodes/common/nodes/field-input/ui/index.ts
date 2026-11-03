import { defineNodeView } from '@/lib/workflow/nodes/core/views';
import { FieldInputForm } from './config';
import { FieldInputContent, FieldInputIcon } from './view';
import { definition } from '../model/definition';
import type { FieldInputConfig } from '../model/types';

export const fieldInputNodeView = defineNodeView<FieldInputConfig>({
  type: definition.type,
  icon: FieldInputIcon,
  config: { Form: FieldInputForm, className: 'sm:max-w-[720px]' },
  display: { size: { width: 260, height: 108 }, Content: FieldInputContent },
});
