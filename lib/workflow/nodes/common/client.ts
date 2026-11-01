import { base64NodeView } from './base64/client';
import { isConfig as isBase64Config } from './base64/model/schema';
import { fieldInputNodeView } from './field-input/client';
import { isConfig as isFieldInputConfig } from './field-input/model/schema';
import { httpRequestNodeView } from './http-request/client';
import { isConfig as isHttpRequestConfig, outputSchema } from './http-request/model/schema';
import { mergeNodeView } from './merge/client';
import { isConfig as isMergeConfig } from './merge/model/schema';
import type { TypeRegistry } from '../core/type-registry';
import type { NodeViewRegistry } from '../core/views';

export const nodeViews = [httpRequestNodeView, fieldInputNodeView, mergeNodeView, base64NodeView] as const;

export function registerCommonViews(types: TypeRegistry, views: NodeViewRegistry): void {
  types.registerType(outputSchema);
  views.registerNodeView(httpRequestNodeView, isHttpRequestConfig);
  views.registerNodeView(mergeNodeView, isMergeConfig);
  views.registerNodeView(fieldInputNodeView, isFieldInputConfig);
  views.registerNodeView(base64NodeView, isBase64Config);
}
