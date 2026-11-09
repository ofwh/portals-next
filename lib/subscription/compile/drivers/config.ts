import { stringify } from 'yaml';
import { clashNode, iniNode, singboxNode } from './nodes';
import { clashGroups, iniGroups, singboxGroups } from './policy';
import { clashRules, iniRules, singboxRules } from './rules';
import { encodeNodes, serializeIni, templateIni, templateObject, writeSection } from './shared';
import type { CompileContext } from '../types';

export function compileClash(context: CompileContext): string {
  const document = templateObject(context, 'yaml');
  const original = document['proxy-groups'];
  const nodes = encodeNodes(context, clashNode);

  if (context.nodes.length || nodes.length) {
    document.proxies = nodes.length ? nodes.map(({ value }) => value) : null;
  }

  const groups = clashGroups(
    context,
    nodes.map(({ node }) => node),
    original,
  );

  document['proxy-groups'] = groups.length ? groups : null;
  if (context.options.enableRuleGenerator) {
    const rules = clashRules(context, document);

    document.rules = [
      ...(!context.options.overwriteOriginalRules && Array.isArray(document.rules) ? document.rules : []),
      ...rules,
    ];
  }

  const ordered = Object.fromEntries(
    Object.entries(document).filter(([key]) => !['proxy-providers', 'proxies', 'proxy-groups', 'rules'].includes(key)),
  );

  if (Object.hasOwn(document, 'proxy-providers')) {
    ordered['proxy-providers'] = document['proxy-providers'];
  }

  if (Object.hasOwn(document, 'proxies')) {
    ordered.proxies = document.proxies;
  }

  ordered['proxy-groups'] = document['proxy-groups'];
  if (Object.hasOwn(document, 'rules')) {
    ordered.rules = document.rules;
  }

  return stringify(ordered, { lineWidth: 0 });
}

export function compileSingbox(context: CompileContext): string {
  const document = templateObject(context, 'json');
  const nodes = encodeNodes(context, singboxNode);
  const outbounds = [
    { type: 'direct', tag: 'DIRECT' },
    ...nodes.map(({ value }) => value),
    ...singboxGroups(
      context,
      nodes.map(({ node }) => node),
    ),
    { type: 'selector', tag: 'GLOBAL', outbounds: ['DIRECT', ...nodes.map(({ node }) => node.name)] },
  ];

  document.outbounds = outbounds;
  if (context.options.enableRuleGenerator) {
    singboxRules(context, document);
  }

  return JSON.stringify(document);
}

export function compileIni(context: CompileContext): string {
  const document = templateIni(context);
  const section = context.target === 'quanx' ? 'server_local' : context.target === 'mellow' ? 'Endpoint' : 'Proxy';

  if (context.target !== 'mellow') {
    writeSection(
      document,
      section,
      context.target === 'surge' || context.target === 'surfboard' ? ['DIRECT = direct'] : [],
      true,
    );
  }

  const nodes = encodeNodes(context, (node, index) => iniNode(node, context.target, document, index), true);

  writeSection(
    document,
    section,
    nodes.map(({ value }) => value),
  );
  iniGroups(
    context,
    nodes.map(({ node }) => node),
    document,
  );
  if (context.options.enableRuleGenerator) {
    iniRules(context, document);
  }

  return serializeIni(document);
}
