import { parse } from './parser';
import { extract, supports, transform } from './transform';
import type { UriConfig, UriNode, UriNodeFields } from '../../types/providers/uri';
import { SubscriptionProvider } from '../provider';

export type * from '../../types/providers/uri';

export class UriProvider extends SubscriptionProvider<UriConfig, UriNode, UriNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): UriConfig {
    return parse(content);
  }

  protected parse(content: string): UriConfig {
    return UriProvider.parse(content);
  }

  protected extract = extract;
}
