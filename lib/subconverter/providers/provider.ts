import type { Provider } from '../types/providers/provider';
import type { ProxyNodeFields } from '../types/proxy-node';
import type { Transformer } from '../types/proxy-node/transform';

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
