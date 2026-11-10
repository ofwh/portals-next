export type PolicyTransformer =
  'surge' | 'surfboard' | 'clash' | 'stash' | 'quan' | 'quanx' | 'loon' | 'mellow' | 'singbox';
export type ProxyGroupKind = 'select' | 'url-test' | 'fallback' | 'load-balance' | 'relay' | 'ssid' | 'smart';

export type MemberSelector =
  | { kind: 'name'; pattern: string }
  | { kind: 'reference'; name: string }
  | { kind: 'script'; source: string }
  | { kind: 'group' | 'group-id' | 'insert' | 'type' | 'port' | 'server'; target: string; pattern?: string };

export type GroupHealthCheck = { url?: string; interval?: number; timeout?: number; tolerance?: number };

export type ProxyGroup = {
  name: string;
  kind: ProxyGroupKind;
  selectors: MemberSelector[];
  providerRefs: string[];
  healthCheck?: GroupHealthCheck;
  disableUdp?: boolean;
  interruptExistConnections?: boolean;
  lazy?: boolean;
  evaluateBeforeUse?: boolean;
  persistent?: boolean;
  strategy?: 'consistent-hashing' | 'round-robin';
};
