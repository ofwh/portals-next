import { isRecord } from '@/lib/shared/data';
import type { RuleProjection } from '@/lib/subconverter/rulesets/output/singbox';
import type { NodeProjection } from './nodes';
import type { JsonValue, NativeObject, OutputContext, OutputParts } from '../../types/output';
import { templateDocument } from '../shared/template';

export function combine(
  parts: OutputParts<NodeProjection, RuleProjection, NativeObject[]>,
  context: OutputContext,
): NativeObject {
  const document = templateDocument(context.template, 'singbox') ?? {};
  const outbounds: NativeObject[] = [];

  let endpoints: JsonValue[] = [];

  if (Array.isArray(document.endpoints)) {
    endpoints = document.endpoints;
  }

  for (const entry of parts.nodes.entries) {
    if (entry.value.region === 'endpoints') {
      endpoints.push(entry.value.value);
    } else {
      outbounds.push(entry.value.value);
    }
  }

  outbounds.push(...parts.policies.value);
  outbounds.push({ type: 'direct', tag: 'DIRECT' });

  let route: NativeObject = {};

  if (isRecord(document.route)) {
    route = document.route;
  }

  if (!route.rules || context.generateRules) {
    route.rules = parts.rules.value.rules;
  }

  if (parts.rules.value.final) {
    route.final = parts.rules.value.final;
  }

  return {
    ...document,
    outbounds,
    endpoints,
    route,
  };
}
