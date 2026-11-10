export type RuleContentCategory = 'surge' | 'quanx' | 'clash-domain' | 'clash-ipcidr' | 'clash-classic';
export type RuleCategory = RuleContentCategory | 'singbox';
export type RulesetTransformer = 'surge' | 'quanx' | 'clash' | 'singbox';

export type Rule = { type: string; parameters: string[]; flags: string[] };

export type RuleSetOptions = {
  noResolve?: boolean;
  stashFormat?: 'yaml' | 'text' | 'mrs';
  tag?: string;
  format?: 'source' | 'binary';
  downloadDetour?: string;
};

export type RuleSet = {
  id: string;
  group: string;
  source: { kind: 'inline'; rule: Rule } | { kind: 'resource'; address: string };
  options: RuleSetOptions;
} & ({ category: RuleContentCategory; interval: number } | { category: 'singbox'; interval?: number });
