import { parse } from './parser';
import { extract, supports, transform } from './transform';
import type { LoonConfig, LoonNode, LoonNodeFields } from '../../types/providers/loon';
import { SubscriptionProvider } from '../provider';

export type * from '../../types/providers/loon';

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
