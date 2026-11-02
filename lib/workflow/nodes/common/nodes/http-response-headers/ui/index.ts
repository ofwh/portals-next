import { defineNodeView } from '@/lib/workflow/nodes/core/views';
import { HttpResponseHeadersForm } from './config';
import { HttpResponseHeadersContent, HttpResponseHeadersIcon } from './view';
import { definition } from '../model/definition';
import type { HttpResponseHeadersConfig } from '../model/types';

export const httpResponseHeadersNodeView = defineNodeView<HttpResponseHeadersConfig>({
  type: definition.type,
  icon: HttpResponseHeadersIcon,
  config: { Form: HttpResponseHeadersForm },
  display: { size: { width: 260, height: 132 }, Content: HttpResponseHeadersContent },
});
