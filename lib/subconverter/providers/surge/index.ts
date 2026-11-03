import { parse } from './parser';
import { extract, supports, transform } from './transform';
import type { SurgeConfig, SurgeNode, SurgeNodeFields } from '../../types/providers/surge';
import { SubscriptionProvider } from '../provider';

export type * from '../../types/providers/surge';

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
