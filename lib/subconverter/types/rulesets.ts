export type RuleSourceFormat = 'surge' | 'quanx' | 'clash-domain' | 'clash-ipcidr' | 'clash-classic';

export type RuleResourceFormat = 'yaml' | 'text' | 'mrs';

interface RuleGroupBase {
  policy: string;
  interval: number;
}

export type RuleGroupFields =
  | (RuleGroupBase & { type: 'inline'; rule: string })
  | (RuleGroupBase & {
      type: 'remote';
      url: string;
      format: RuleSourceFormat;
      noResolve: boolean;
      resourceFormat?: RuleResourceFormat;
    });

export type RuleSetConfigFields = RuleGroupFields;

export interface RuleSetConfigNode {
  group: string;
  rule?: string;
  ruleset?: string;
  type?: string;
  interval?: string;
  options?: readonly string[];
}
