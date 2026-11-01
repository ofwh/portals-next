import type { ProxyNode, ProxyNodeType, ProxyProtocol } from '@/lib/types/subscriptions/nodes';

export type ProviderConfig = { [key: string]: unknown };
export interface ProviderStringOptions {
  [key: string]: unknown;
}

export abstract class ConfigProvider<C extends object> {
  protected config: C | undefined;

  abstract readonly supports: readonly ProxyNodeType[];

  constructor(
    private readonly defaultType: string,
    private readonly parseContent: (content: string) => C,
  ) {}

  get proxies(): unknown[] {
    return this.config ? this.extract<unknown[]>() : [];
  }

  get groups(): unknown[] {
    return [];
  }

  get rules(): unknown[] {
    return [];
  }

  protected abstract readNodes(config: C): ProxyNode[];
  protected abstract writeNodes(nodes: ProxyNode[]): C;

  load(content: string): C {
    const config = this.parseContent(content);

    this.config = config;

    return structuredClone(config);
  }

  extract<T = C[keyof C]>(type = this.defaultType): T {
    if (!this.config) {
      throw new Error('Parse content before extracting configuration');
    }

    if (!Object.hasOwn(this.config, type)) {
      throw new Error('Configuration section does not exist');
    }

    return structuredClone((this.config as Record<string, unknown>)[type]) as T;
  }

  transform(): ProxyNode[] {
    if (!this.config) {
      throw new Error('Parse content before extracting proxies');
    }

    return this.readNodes(structuredClone(this.config));
  }

  format<T extends ProxyProtocol = ProxyProtocol>(nodes: ProxyNode<T>[]): C {
    const config = this.writeNodes(nodes.filter((node) => this.supports.some((type) => type === node.type)));

    this.config = { ...this.config, ...config };

    return structuredClone(this.config);
  }

  toString(_options?: ProviderStringOptions): string {
    throw new Error('Provider serialization is not implemented');
  }
}
