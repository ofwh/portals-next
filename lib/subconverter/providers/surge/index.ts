import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { SurgeConfig, SurgeNode, SurgeNodeFields } from '../../types/surge';

export type * from '../../types/surge';

export class SurgeProvider extends SubscriptionProvider<SurgeConfig, SurgeNode, SurgeNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): SurgeConfig {
    return parse(content);
  }

  protected parse(content: string): SurgeConfig {
    return SurgeProvider.parse(content);
  }

  protected extract = extract;
}
