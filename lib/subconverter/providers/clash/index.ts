import { parse } from './parser';
import { extract, supports, transform } from './transform';
import type { ClashConfig, ClashNode, ClashNodeFields } from '../../types/providers/clash';
import { SubscriptionProvider } from '../provider';

export type * from '../../types/providers/clash';

export class ClashProvider extends SubscriptionProvider<ClashConfig, ClashNode, ClashNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): ClashConfig {
    return parse(content);
  }

  protected parse(content: string): ClashConfig {
    return ClashProvider.parse(content);
  }

  protected extract = extract;
}
