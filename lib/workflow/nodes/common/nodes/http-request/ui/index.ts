import { defineNodeView } from '@/lib/workflow/nodes/core/views';
import { HttpRequestForm } from './config';
import { HttpRequestContent, HttpRequestIcon } from './view';
import { definition } from '../model/definition';
import type { HttpRequestConfig } from '../model/types';

export const httpRequestNodeView = defineNodeView<HttpRequestConfig>({
  type: definition.type,
  icon: HttpRequestIcon,
  config: { Form: HttpRequestForm },
  display: { size: { width: 260, height: 132 }, Content: HttpRequestContent },
});
