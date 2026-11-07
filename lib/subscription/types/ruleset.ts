export type RulesetFormat = 'ini' | 'yaml' | 'toml';
export type RuleCategory = 'surge' | 'quanx' | 'clash-domain' | 'clash-ipcidr' | 'clash-classic';
export type RulesetResolver = 'surge' | 'quanx' | 'clash';

export type Rule = { type: string; parameters: string[]; flags: string[] };

export type RuleSetOptions = { noResolve?: boolean; stashFormat?: 'yaml' | 'text' | 'mrs' };

export type RuleSet = {
  id: string;
  group: string;
  category: RuleCategory;
  source: { kind: 'inline'; rule: Rule } | { kind: 'resource'; address: string };
  interval: number;
  options: RuleSetOptions;
};
