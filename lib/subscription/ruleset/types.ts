import type { SourcePosition } from '../types/diagnostic';
import type { RuleContentCategory, RuleSetOptions } from '../types/ruleset';

type Declaration = {
  id: string;
  group: string;
  source: { kind: 'inline'; content: string } | { kind: 'resource'; address: string };
  options: RuleSetOptions;
};

export type RuleContentDeclaration = Declaration & { category?: RuleContentCategory; interval: number };
export type RulesetDeclaration = RuleContentDeclaration | (Declaration & { category: 'singbox'; interval?: number });

export type RulesetEntry = { value: unknown; position: SourcePosition };
