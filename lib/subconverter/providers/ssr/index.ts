import { parse } from './parser';
import { extract, supports, transform } from './transform';
import type { SSRConfig, SSRNode, SSRNodeFields } from '../../types/providers/ssr';
import { SubscriptionProvider } from '../provider';

export type * from '../../types/providers/ssr';

export class SSRProvider extends SubscriptionProvider<SSRConfig, SSRNode, SSRNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): SSRConfig {
    return parse(content);
  }

  protected parse(content: string): SSRConfig {
    return SSRProvider.parse(content);
  }

  protected extract = extract;
}
