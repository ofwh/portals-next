import { createElement } from 'react';
import type { ComponentType } from 'react';
import { appError } from '@/lib/api';
import { nonempty } from '../../utils';
import type { NodeContentProps, NodeFormProps, NodeView } from '../types';

export interface RegisteredNodeView {
  type: string;
  icon: NodeView<unknown>['icon'];
  config: { Form: ComponentType<NodeFormProps<unknown>> };
  display?: { size: { width: number; height: number }; Content: ComponentType<NodeContentProps<unknown>> };
}

export function defineNodeView<C>(view: NodeView<C>): NodeView<C> {
  return view;
}

export class NodeViewRegistry {
  private readonly views = new Map<string, RegisteredNodeView>();

  registerNodeView<C>(view: NodeView<C>, isConfig: (value: unknown) => value is C): void {
    if (this.views.has(view.type)) {
      throw appError('workflow.DUPLICATE_NODE');
    }

    const display = view.display;

    if (
      !nonempty(view.type) ||
      (display &&
        (!Number.isFinite(display.size.width) ||
          !Number.isFinite(display.size.height) ||
          display.size.width <= 0 ||
          display.size.height <= 0))
    ) {
      throw appError('common.INVALID_PARAMS');
    }

    const check = (value: unknown): C => {
      if (!isConfig(value)) {
        throw appError('common.INVALID_PARAMS');
      }

      return value;
    };

    this.views.set(view.type, {
      type: view.type,
      icon: view.icon,
      config: { Form: (props) => createElement(view.config.Form, { ...props, value: check(props.value) }) },
      ...(display
        ? {
            display: {
              size: Object.freeze({ ...display.size }),
              Content: (props: NodeContentProps<unknown>) =>
                createElement(display.Content, { ...props, node: { ...props.node, config: check(props.node.config) } }),
            },
          }
        : {}),
    });
  }

  getNodeView(type: string): RegisteredNodeView | undefined {
    return this.views.get(type);
  }
}
export const nodeViewRegistry = new NodeViewRegistry();
export const registerNodeView = <C>(view: NodeView<C>, isConfig: (value: unknown) => value is C): void =>
  nodeViewRegistry.registerNodeView(view, isConfig);
