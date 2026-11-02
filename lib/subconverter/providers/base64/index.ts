import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { Base64Config, Base64Node, Base64NodeFields } from '../../types/base64';

export type * from '../../types/base64';

export class Base64Provider extends SubscriptionProvider<Base64Config, Base64Node, Base64NodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): Base64Config {
    return parse(content);
  }

  protected parse(content: string): Base64Config {
    return Base64Provider.parse(content);
  }

  protected extract = extract;
}
