import { parse } from './parser';
import { extract, supports, transform } from './transform';
import type { SurfboardConfig, SurfboardNode, SurfboardNodeFields } from '../../types/providers/surfboard';
import { SubscriptionProvider } from '../provider';

export type * from '../../types/providers/surfboard';

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
