import type { ProxyNode } from '../../../types/proxy-node';
import type { TemplateValue } from '../../../types/template';
import { CompileError } from '../../diagnostics';
import type { CompileContext, TargetObject } from '../../types';
import { object } from '../shared';

export function requireOutbound(tags: ReadonlySet<string>, name: string, field: string, index?: number): void {
  if (name === 'REJECT' || !tags.has(name)) {
    throw new CompileError('INVALID_REFERENCE', field, index);
  }
}

export function normalizeDirect(context: CompileContext, document: TargetObject, nodes: ProxyNode[]): void {
  const original = Array.isArray(document.outbounds) ? document.outbounds.filter(object) : [];
  const direct = original.filter((item) => item.tag === 'direct');

  if (!direct.some((item) => item.type === 'direct')) {
    return;
  }

  if (
    direct.length !== 1 ||
    nodes.some((node) => node.name === 'direct') ||
    context.groups.some((group) => group.name === 'direct')
  ) {
    throw new CompileError('DUPLICATE_TAG', 'outbounds');
  }

  for (const group of context.groups) {
    for (const selector of group.selectors) {
      if (selector.kind === 'reference' && selector.name === 'direct') {
        selector.name = 'DIRECT';
      }
    }
  }

  if (!context.options.enableRuleGenerator) {
    return;
  }

  for (const ruleset of context.rulesets) {
    if (ruleset.group === 'direct') {
      ruleset.group = 'DIRECT';
    }

    if (ruleset.options.downloadDetour === 'direct') {
      ruleset.options.downloadDetour = 'DIRECT';
    }
  }

  const route = document.route;

  if (!object(route)) {
    return;
  }

  if (route.final === 'direct') {
    route.final = 'DIRECT';
  }

  const pending: TemplateValue[] = Array.isArray(route.rules) ? [...route.rules] : [];

  while (pending.length) {
    const rule = pending.pop();

    if (object(rule)) {
      if (rule.outbound === 'direct') {
        rule.outbound = 'DIRECT';
      }

      if (Array.isArray(rule.rules)) {
        pending.push(...rule.rules);
      }
    }
  }

  if (Array.isArray(route.rule_set)) {
    for (const set of route.rule_set) {
      if (object(set) && set.download_detour === 'direct') {
        set.download_detour = 'DIRECT';
      }
    }
  }
}

export function validateOutbounds(outbounds: TargetObject[]): Set<string> {
  const tags = new Set<string>();
  const groups = new Map<string, string[]>();

  for (const [index, outbound] of outbounds.entries()) {
    const tag = outbound.tag;

    if (typeof tag !== 'string' || !tag || tag === 'REJECT' || tags.has(tag)) {
      throw new CompileError('DUPLICATE_TAG', 'outbounds', index);
    }

    tags.add(tag);
    if (Array.isArray(outbound.outbounds)) {
      groups.set(
        tag,
        outbound.outbounds.filter((member): member is string => typeof member === 'string'),
      );
    }
  }

  const incoming = new Map([...groups.keys()].map((tag) => [tag, 0]));

  for (const [tag, members] of groups) {
    for (const member of members) {
      requireOutbound(tags, member, `outbounds.${tag}.outbounds`);
      if (groups.has(member)) {
        incoming.set(member, incoming.get(member)! + 1);
      }
    }
  }

  const pending = [...incoming].filter(([, count]) => count === 0).map(([tag]) => tag);
  let visited = 0;

  while (pending.length) {
    const tag = pending.pop()!;

    visited++;
    for (const member of groups.get(tag)!) {
      if (incoming.has(member)) {
        const count = incoming.get(member)! - 1;

        incoming.set(member, count);
        if (count === 0) {
          pending.push(member);
        }
      }
    }
  }

  if (visited !== groups.size) {
    throw new CompileError('CIRCULAR_GROUP_REFERENCE', 'groups.selectors');
  }

  return tags;
}
