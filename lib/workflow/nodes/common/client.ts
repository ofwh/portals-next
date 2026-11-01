import { httpRequestNodeView } from './http-request/client';
import { isConfig as isHttpRequestConfig, outputSchema } from './http-request/schema';
import { mergeNodeView } from './merge/client';
import { isConfig as isMergeConfig } from './merge/schema';
import { textareaNodeView } from './textarea/client';
import { isConfig as isTextareaConfig } from './textarea/schema';
import type { TypeRegistry } from '../core/type-registry';
import type { NodeViewRegistry } from '../core/views';

export const nodeViews = [httpRequestNodeView, textareaNodeView, mergeNodeView] as const;

export function registerCommonViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(outputSchema);
  views.registerNodeView(httpRequestNodeView, isHttpRequestConfig);
  views.registerNodeView(mergeNodeView, isMergeConfig);
  views.registerNodeView(textareaNodeView, isTextareaConfig);
}
