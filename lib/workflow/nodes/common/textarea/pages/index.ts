import { TextareaForm } from './config';
import { TextareaContent, TextareaIcon } from './view';
import { defineNodeView } from '../../../core/views';
import { definition } from '../definition';
import type { TextareaConfig } from '../types';

export const textareaNodeView = defineNodeView<TextareaConfig>({
  type: definition.type,
  icon: TextareaIcon,
  config: { Form: TextareaForm },
  display: { size: { width: 260, height: 108 }, Content: TextareaContent },
});
