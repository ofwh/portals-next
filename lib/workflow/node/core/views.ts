import { createElement } from 'react';
import type { ComponentType } from 'react';
import { appError } from '@/lib/api';
import { nonempty } from '@/lib/shared/data';
import type { NodeContentProps, NodeFormProps, NodeView } from '../types';

export interface RegisteredNodeView {
  type: string;
  icon: NodeView<unknown>['icon'];
  config?: NodeView<unknown>['config'];
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
    const config = view.config;
    const forms = new Map<ComponentType<NodeFormProps<C>>, ComponentType<NodeFormProps<unknown>>>();

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
      ...(config
        ? {
            config: {
              useNodeConfig() {
                const result = config.useNodeConfig();
                const Form = result.ConfigForm;

                if (!Form) {
                  return { title: result.title, description: result.description };
                }

                let ConfigForm = forms.get(Form);

                if (!ConfigForm) {
                  ConfigForm = function CheckedConfigForm(props: NodeFormProps<unknown>) {
                    return createElement(Form, { ...props, value: check(props.value) });
                  };
                  forms.set(Form, ConfigForm);
                }

                return { ...result, ConfigForm };
              },
              className: config.className,
              validate: config.validate ? (value, context) => config.validate!(check(value), context) : undefined,
            },
          }
        : {}),
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
