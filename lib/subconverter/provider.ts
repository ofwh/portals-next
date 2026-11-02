import type { Transformer } from './transform';
import type { ProxyType } from './types/common';
import type { ProxyNodeFields } from './types/proxy-node';

export interface Provider<C extends object, N, F extends ProxyNodeFields> {
  readonly supports: readonly F['type'][];
  config: C | undefined;
  nodes: N[];
  load(content: string): C;
  transform: Transformer<N, F>;
}

export interface ProviderConstructor<C extends object, N, F extends ProxyNodeFields> {
  new (): Provider<C, N, F>;
  readonly supports: readonly F['type'][];
  parse(content: string): C;
}

export abstract class SubscriptionProvider<C extends object, N, F extends ProxyNodeFields> implements Provider<
  C,
  N,
  F
> {
  abstract readonly supports: readonly F['type'][];
  abstract readonly transform: Transformer<N, F>;
  config: C | undefined;
  nodes: N[] = [];

  protected abstract parse(content: string): C;
  protected abstract extract(config: C): N[];

  load(content: string): C {
    const config = this.parse(content);
    const nodes = this.extract(config);

    this.config = config;
    this.nodes = nodes;

    return config;
  }
}

export type { ProxyType };
