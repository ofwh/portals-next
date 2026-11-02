import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { LoonConfig, LoonNode, LoonNodeFields } from '../../types/loon';

export type * from '../../types/loon';

export class LoonProvider extends SubscriptionProvider<LoonConfig, LoonNode, LoonNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): LoonConfig {
    return parse(content);
  }

  protected parse(content: string): LoonConfig {
    return LoonProvider.parse(content);
  }

  protected extract = extract;
}
