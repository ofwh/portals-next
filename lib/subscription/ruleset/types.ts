import type { SourcePosition } from '../types/diagnostic';
import type { RuleCategory, RuleSetOptions } from '../types/ruleset';

export type RulesetDeclaration = {
  id: string;
  group: string;
  category?: RuleCategory;
  source: { kind: 'inline'; content: string } | { kind: 'resource'; address: string };
  interval: number;
  options: RuleSetOptions;
};

export type RulesetEntry = { value: unknown; position: SourcePosition };
