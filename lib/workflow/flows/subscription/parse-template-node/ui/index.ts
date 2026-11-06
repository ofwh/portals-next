import { defineNodeView } from '@/lib/workflow/node/core/views';
import { ParseTemplateForm } from './config';
import { ParseTemplateContent, ParseTemplateIcon } from './view';
import { definition } from '../model/definition';
import type { ParseTemplateConfig } from '../model/types';

export const parseTemplateNodeView = defineNodeView<ParseTemplateConfig>({
  type: definition.type,
  icon: ParseTemplateIcon,
  config: { Form: ParseTemplateForm },
  display: { size: { width: 260, height: 108 }, Content: ParseTemplateContent },
});
