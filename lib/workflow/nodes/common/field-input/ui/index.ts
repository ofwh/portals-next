import { FieldInputForm } from './config';
import { FieldInputContent, FieldInputIcon } from './view';
import { defineNodeView } from '../../../core/views';
import { definition } from '../model/definition';
import type { FieldInputConfig } from '../model/types';

export const fieldInputNodeView = defineNodeView<FieldInputConfig>({
  type: definition.type,
  icon: FieldInputIcon,
  config: { Form: FieldInputForm },
  display: { size: { width: 260, height: 108 }, Content: FieldInputContent },
});
