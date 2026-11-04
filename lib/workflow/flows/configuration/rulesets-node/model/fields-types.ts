export interface RulesetIssue {
  path: (string | number)[];
  code: 'required' | 'integer';
}
