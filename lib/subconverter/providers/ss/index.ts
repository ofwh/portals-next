import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { SSConfig, SSNode, SSNodeFields } from '../../types/ss';

export type * from '../../types/ss';

export class SSProvider extends SubscriptionProvider<SSConfig, SSNode, SSNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): SSConfig {
    return parse(content);
  }

  protected parse(content: string): SSConfig {
    return SSProvider.parse(content);
  }

  protected extract = extract;
}
