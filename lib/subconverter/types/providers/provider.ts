import type { ProxyNodeFields, ProxyType } from '../proxy-node';
import type { Transformer } from '../proxy-node/transform';

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

export type { ProxyType };
