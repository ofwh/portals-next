import { fieldInputNodeView } from './field-input-node/client';
import { isConfig as isFieldInputConfig } from './field-input-node/model/schema';
import { httpRequestNodeView } from './http-request-node/client';
import { isConfig as isHttpRequestConfig } from './http-request-node/model/schema';
import { httpResponseHeadersNodeView } from './http-response-headers-node/client';
import { isConfig as isHttpResponseHeadersConfig } from './http-response-headers-node/model/schema';
import { mergeNodeView } from './merge-node/client';
import { isConfig as isMergeConfig } from './merge-node/model/schema';
import type { NodeViewRegistry } from '../../node/core/views';

export const nodeViews = [httpRequestNodeView, httpResponseHeadersNodeView, fieldInputNodeView, mergeNodeView] as const;

export function registerCommonViews(views: NodeViewRegistry): void {
  views.registerNodeView(httpRequestNodeView, isHttpRequestConfig);
  views.registerNodeView(httpResponseHeadersNodeView, isHttpResponseHeadersConfig);
  views.registerNodeView(mergeNodeView, isMergeConfig);
  views.registerNodeView(fieldInputNodeView, isFieldInputConfig);
}
