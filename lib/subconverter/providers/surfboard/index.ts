import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { SurfboardConfig, SurfboardNode, SurfboardNodeFields } from '../../types/surfboard';

export type * from '../../types/surfboard';

export class SurfboardProvider extends SubscriptionProvider<SurfboardConfig, SurfboardNode, SurfboardNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): SurfboardConfig {
    return parse(content);
  }

  protected parse(content: string): SurfboardConfig {
    return SurfboardProvider.parse(content);
  }

  protected extract = extract;
}
