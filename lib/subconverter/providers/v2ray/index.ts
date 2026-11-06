import { parse } from './parser';
import { extract, supports, transform } from './transform';
import type { V2RayConfig, V2RayNode, V2RayNodeFields } from '../../types/providers/v2ray';
import { SubscriptionProvider } from '../provider';

export type * from '../../types/providers/v2ray';

export class V2RayProvider extends SubscriptionProvider<V2RayConfig, V2RayNode, V2RayNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): V2RayConfig {
    return parse(content);
  }

  protected parse(content: string): V2RayConfig {
    return V2RayProvider.parse(content);
  }

  protected extract = extract;
}
