import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { QuanXConfig, QuanXNode, QuanXNodeFields } from '../../types/quanx';

export type * from '../../types/quanx';

export class QuanXProvider extends SubscriptionProvider<QuanXConfig, QuanXNode, QuanXNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): QuanXConfig {
    return parse(content);
  }

  protected parse(content: string): QuanXConfig {
    return QuanXProvider.parse(content);
  }

  protected extract = extract;
}
