import type { RuleProjection } from '@/lib/subconverter/rulesets/output/clash';
import type { JsonValue, NativeObject, OutputContext, OutputParts } from '../../types/output';
import { templateDocument } from '../shared/template';

export function combine(
  parts: OutputParts<NativeObject, RuleProjection, NativeObject[]>,
  context: OutputContext,
  stash = false,
): NativeObject {
  const format = stash ? 'stash' : 'clash';
  const document = templateDocument(context.template, format) ?? {};
  let proxies: JsonValue[] = parts.nodes.entries.map((entry) => entry.value);
  let groups: JsonValue[] = parts.policies.value;
  let rules: JsonValue = parts.rules.value.rules;

  if (stash && Array.isArray(document.proxies)) {
    proxies = [...document.proxies, ...proxies];
  }

  const templateGroups = document['proxy-groups'];

  if (stash && !groups.length && Array.isArray(templateGroups)) {
    groups = templateGroups;
  }

  if (document.rules && !context.generateRules) {
    rules = document.rules;
  }

  const generatedProviders = parts.rules.value.providers;

  if (Object.keys(generatedProviders).length > 0) {
    let providers = document['rule-providers'];

    if (!providers || typeof providers !== 'object' || Array.isArray(providers)) {
      providers = {};
    }

    Object.assign(providers, generatedProviders);
    document['rule-providers'] = providers;
  }

  return {
    ...document,
    proxies,
    'proxy-groups': groups,
    rules,
  };
}
