import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { SingBoxConfig, SingBoxNode, SingBoxNodeFields } from '../../types/sing-box';

export type * from '../../types/sing-box';

export class SingBoxProvider extends SubscriptionProvider<SingBoxConfig, SingBoxNode, SingBoxNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): SingBoxConfig {
    return parse(content);
  }

  protected parse(content: string): SingBoxConfig {
    return SingBoxProvider.parse(content);
  }

  protected extract = extract;
}
