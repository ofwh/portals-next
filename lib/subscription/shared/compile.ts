import type { CompileTarget } from '../types/compile';
import type { RuleSet } from '../types/ruleset';

export const compileTargets = {
  mixed: { label: 'Mixed', format: 'uri' },
  clash: { label: 'Clash', format: 'yaml' },
  loon: { label: 'Loon', format: 'ini' },
  singbox: { label: 'sing-box', format: 'json' },
  quanx: { label: 'Quantumult X', format: 'ini' },
  surge: { label: 'Surge', format: 'ini' },
  surfboard: { label: 'Surfboard', format: 'ini' },
  mellow: { label: 'Mellow', format: 'ini' },
  v2rayn: { label: 'v2rayN', format: 'uri' },
  v2rayng: { label: 'v2rayNG', format: 'uri' },
} as const satisfies Record<CompileTarget, { label: string; format: 'uri' | 'yaml' | 'json' | 'ini' }>;
export const compileTargetOptions = Object.entries(compileTargets).map(([value, { label }]) => ({
  value: value as CompileTarget,
  label,
}));

export function isCompileTarget(value: unknown): value is CompileTarget {
  return typeof value === 'string' && Object.hasOwn(compileTargets, value);
}

export function ruleDelivery(target: CompileTarget, ruleset: RuleSet): 'inline' | 'expand' | 'remote' | 'skip' {
  if (compileTargets[target].format === 'uri') {
    return 'skip';
  }

  if (ruleset.category === 'singbox') {
    return target === 'singbox' ? 'remote' : 'skip';
  }

  if (ruleset.source.kind === 'inline') {
    return 'inline';
  }

  if (target === 'clash') {
    return /^https?:\/\//i.test(ruleset.source.address) &&
      ['clash-domain', 'clash-ipcidr', 'clash-classic'].includes(ruleset.category)
      ? 'remote'
      : 'skip';
  }

  if (/^https?:\/\//i.test(ruleset.source.address)) {
    if (target === 'surge') {
      return ruleset.category === 'surge' ? 'remote' : 'skip';
    }

    if (target === 'loon' || (target === 'quanx' && ruleset.category === 'quanx')) {
      return 'remote';
    }
  }

  return 'expand';
}
