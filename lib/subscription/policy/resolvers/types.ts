import type { ProxyGroup, ProxyGroupKind } from '../../types/policy';

export type GroupDeclaration = {
  name: string;
  kind: ProxyGroupKind;
  rules: string[];
  providers: string[];
  syntax: 'delimited' | 'object';
  fields: Record<string, unknown>;
  flags?: ProxyGroup['flags'];
  policyPath?: ProxyGroup['policyPath'];
};

export type GroupCategoryResolver = {
  kind: ProxyGroupKind;
  resolve: (declaration: GroupDeclaration) => ProxyGroup;
};
