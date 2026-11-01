import { HttpRequestForm } from './config';
import { HttpRequestContent, HttpRequestIcon } from './view';
import { defineNodeView } from '../../../core/views';
import { definition } from '../definition';
import type { HttpRequestConfig } from '../types';

export const httpRequestNodeView = defineNodeView<HttpRequestConfig>({
  type: definition.type,
  icon: HttpRequestIcon,
  config: { Form: HttpRequestForm },
  display: { size: { width: 260, height: 132 }, Content: HttpRequestContent },
});
