import { parse } from './parser';
import { extract, supports, transform } from './transform';
import { SubscriptionProvider } from '../../provider';
import type { IniConfig, IniNode, IniNodeFields } from '../../types/ini';

export type * from '../../types/ini';

export class IniProvider extends SubscriptionProvider<IniConfig, IniNode, IniNodeFields> {
  static readonly supports = supports;
  readonly supports = supports;
  readonly transform = transform;

  static parse(content: string): IniConfig {
    return parse(content);
  }

  protected parse(content: string): IniConfig {
    return IniProvider.parse(content);
  }

  protected extract = extract;
}
