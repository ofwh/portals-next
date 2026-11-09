import type { CompileParams, CompileTarget } from '@/lib/subscription/types/compile';
import type { ProxyGroup } from '@/lib/subscription/types/policy';
import type { ProxyNode } from '@/lib/subscription/types/proxy-node';
import type { RuleSet } from '@/lib/subscription/types/ruleset';
import type { ParsedTemplate } from '@/lib/subscription/types/template';

export type CompileNodeConfig = { target: CompileTarget | '' };
export type CompileNodeValue = ProxyNode[] | ProxyGroup[] | RuleSet[] | ParsedTemplate;
export type CompileNodeData = Pick<CompileParams, 'nodes' | 'groups' | 'rulesets' | 'template'>;
