import type { CONFIG_TYPES } from '../shared/config';

export type ConfigType = (typeof CONFIG_TYPES)[keyof typeof CONFIG_TYPES];

export type ConfigParameter = { type: 'positional'; value: string } | { type: 'named'; name: string; value: unknown };

export type BaseCustomConfig = {
  name: string;
  parameters: ConfigParameter[];
};

export type BaseProxyGroup = BaseCustomConfig & {
  kind: string;
};

export type BaseRuleset = BaseCustomConfig & {
  kind: string;
};

export type ConfigDeclaration =
  | { type: typeof CONFIG_TYPES.PROXY_GROUP; value: BaseProxyGroup }
  | { type: typeof CONFIG_TYPES.RULESET; value: BaseRuleset }
  | { type: typeof CONFIG_TYPES.CUSTOM; value: BaseCustomConfig };
