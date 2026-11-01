import 'server-only';
import { appError } from '@/lib/api';
import { TypeRegistry } from './type-registry';
import type { CanvasNode } from '../../model';
import { createNodeInstance } from '../../model/canvas';
import { cloneJson, freezeDeep, nonempty, positiveInteger } from '../../utils';
import type { ExecutionContext, NodeGroup, NodeModule, NodeModuleGroup, RegisteredNode, ValueSchema } from '../types';

export function defineNode<I, C, O, R = I>(definition: NodeModule<I, C, O, R>): NodeModule<I, C, O, R> {
  return definition;
}

export class NodeRegistry {
  private readonly nodes = new Map<string, RegisteredNode>();
  private readonly groups = new Map<string, Pick<NodeGroup, 'name' | 'nameKey'> & { types: readonly string[] }>();

  constructor(readonly types: TypeRegistry = new TypeRegistry()) {}

  registerNode<I, C, O, R>(node: NodeModule<I, C, O, R>): void {
    if (this.nodes.has(node.type) && process.env.NODE_ENV !== 'development') {
      throw appError('workflow.DUPLICATE_NODE');
    }

    if (
      !nonempty(node.type) ||
      !nonempty(node.name) ||
      !positiveInteger(node.version) ||
      (node.input !== null && (typeof node.input.required !== 'boolean' || typeof node.input.multiple !== 'boolean')) ||
      (node.output !== null && typeof node.output.multiple !== 'boolean')
    ) {
      throw appError('common.INVALID_PARAMS');
    }

    const input = node.input;
    const output = node.output;

    const manifest = freezeDeep(
      cloneJson({
        type: node.type,
        name: node.name,
        ...(node.nameKey ? { nameKey: node.nameKey } : {}),
        version: node.version,
        input: input ? { type: input.schema.descriptor, required: input.required, multiple: input.multiple } : null,
        output: output ? { type: output.schema.descriptor, multiple: output.multiple } : null,
      }),
    );
    const parse = <T>(schema: ValueSchema<T>, raw: unknown): T => {
      const value = schema.parse(cloneJson(raw));

      this.types.parse(schema.descriptor, cloneJson(value));

      return value;
    };
    const parseConfig = (raw: unknown): C => {
      const config = node.configSchema.parse(node.parseConfig(cloneJson(raw)));

      return cloneJson(config);
    };
    const defaultConfig = freezeDeep(cloneJson(node.defaultConfig));

    this.nodes.set(
      node.type,
      Object.freeze({
        manifest,
        defaultConfig,
        parseConfig,
        run: async (values: readonly unknown[], config: unknown, context: ExecutionContext): Promise<unknown> => {
          context.signal.throwIfAborted();
          if (
            (!input && values.length > 0) ||
            (input && ((!input.multiple && values.length > 1) || (input.required && !values.length)))
          ) {
            throw appError('workflow.INVALID_CONNECTION');
          }

          const parsed = input ? values.map((value) => parse(input.schema, value)) : [];
          const result = await node.execute(
            node.parseInput(parsed, context),
            node.configSchema.parse(cloneJson(config)),
            context,
          );

          context.signal.throwIfAborted();

          return output ? cloneJson(parse(output.schema, result)) : undefined;
        },
      }),
    );
  }

  getNode(type: string): RegisteredNode {
    const node = this.nodes.get(type);

    if (!node) {
      throw appError('workflow.NODE_NOT_FOUND');
    }

    if (node.manifest.input) {
      this.types.validateDescriptor(node.manifest.input.type);
    }

    if (node.manifest.output) {
      this.types.validateDescriptor(node.manifest.output.type);
    }

    return node;
  }

  hasNode(type: string): boolean {
    return this.nodes.has(type);
  }

  manifests() {
    return [...this.nodes.values()].map((node) => cloneJson(this.getNode(node.manifest.type).manifest));
  }

  defaults(): Record<string, unknown> {
    return Object.fromEntries([...this.nodes].map(([type, node]) => [type, cloneJson(node.defaultConfig)]));
  }

  registerNodeGroup(group: NodeModuleGroup): void {
    const types = group.nodes.map((node) => node.type);

    this.validateGroup(group, types);
    group.types?.forEach((type) => this.types.registerType(type));
    if (process.env.NODE_ENV === 'development') {
      this.groups.get(group.id)?.types.forEach((type) => this.nodes.delete(type));
      this.groups.delete(group.id);
    }

    group.nodes.forEach((node) => this.registerNode(node));
    this.registerGroup(group, types);
  }

  registerGroup(group: Pick<NodeGroup, 'id' | 'name' | 'nameKey'>, types: readonly string[]): void {
    this.validateGroup(group, types);
    if (types.some((type) => !this.hasNode(type))) {
      throw appError('workflow.NODE_NOT_FOUND');
    }

    this.groups.delete(group.id);
    this.groups.set(group.id, {
      name: group.name,
      ...(group.nameKey ? { nameKey: group.nameKey } : {}),
      types: [...types],
    });
  }

  private validateGroup(group: { id: string; name: string }, types: readonly string[]): void {
    if (!nonempty(group.id) || !nonempty(group.name) || !types.length || new Set(types).size !== types.length) {
      throw appError('common.INVALID_PARAMS');
    }

    if (this.groups.has(group.id) && process.env.NODE_ENV !== 'development') {
      throw appError('workflow.DUPLICATE_GROUP');
    }
  }

  listGroups(): NodeGroup[] {
    return [...this.groups].map(([id, group]) => ({
      id,
      name: group.name,
      ...(group.nameKey ? { nameKey: group.nameKey } : {}),
      nodes: group.types.map((type) => cloneJson(this.getNode(type).manifest)),
    }));
  }

  createNode(type: string, position: CanvasNode['position'], id = crypto.randomUUID()): CanvasNode {
    const node = this.getNode(type);

    return createNodeInstance(node.manifest, node.defaultConfig, position, id);
  }
}
export const nodeRegistry = new NodeRegistry();
export const registerNode = <I, C, O, R>(node: NodeModule<I, C, O, R>): void => nodeRegistry.registerNode(node);
export const registerNodeGroup = (group: NodeModuleGroup): void => nodeRegistry.registerNodeGroup(group);
export const getNode = (type: string): RegisteredNode => nodeRegistry.getNode(type);
