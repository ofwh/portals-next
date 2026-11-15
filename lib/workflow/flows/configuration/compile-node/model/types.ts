import type { CompileParams, SubscriptionType } from '@/lib/sub/compile';
import type { ConfigDeclaration, ProxyNode, TemplateDocument } from '@/lib/sub/types';

export type CompileNodeConfig = { target: SubscriptionType | '' };
export type CompileNodeValue = ProxyNode[] | ConfigDeclaration[] | TemplateDocument;
export type CompileNodeData = Required<Pick<CompileParams, 'nodes' | 'config'>> & { template?: TemplateDocument };
