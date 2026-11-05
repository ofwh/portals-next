import 'server-only';
import { adapter as clash } from './clash';
import { adapter as clashr } from './clashr';
import { adapter as loon } from './loon';
import { generate as mixed } from './mixed';
import { adapter as quanx } from './quanx';
import { generate as shadowrocket } from './shadowrocket';
import { filterUnsupportedNodes } from './shared/nodes';
import { builtinSymbols } from './shared/policies';
import { materializeRules } from './shared/rules';
import { adapter as singbox } from './singbox';
import { generate as ss } from './ss';
import { adapter as stash } from './stash';
import { adapter as surfboard } from './surfboard';
import { adapter as surge } from './surge';
import type { ConfigArtifact, OutputAdapter, OutputContext, OutputElements, OutputTarget } from '../types/output';

async function render<N, R, P, D extends object>(
  adapter: OutputAdapter<N, R, P, D>,
  elements: OutputElements,
  signal: AbortSignal,
): Promise<ConfigArtifact<D>> {
  signal.throwIfAborted();
  const context: OutputContext = { symbols: builtinSymbols(adapter.target === 'quanx'), ruleSources: [] };
  const nodes = filterUnsupportedNodes(elements.nodes, (values) => adapter.nodes.transform(values, context));
  const nodeContext = { ...context, symbols: [...context.symbols, ...nodes.entries.map((entry) => entry.symbol)] };
  const policies = adapter.policies.transform(elements.policies, nodes, nodeContext);
  const ruleContext = {
    ...nodeContext,
    symbols: [...nodeContext.symbols, ...policies.symbols],
    ruleSources: await materializeRules(elements.rules, adapter.target, signal),
  };
  const rules = adapter.rules.transform(elements.rules, ruleContext);
  const document = adapter.combine({ nodes, policies, rules }, ruleContext);

  signal.throwIfAborted();

  return {
    target: adapter.target,
    document,
    mediaType: adapter.mediaType,
    content: adapter.toString(document),
    issues: [...nodes.issues, ...policies.issues, ...rules.issues],
  };
}

const generators = {
  clash: (elements, signal) => render(clash, elements, signal),
  clashr: (elements, signal) => render(clashr, elements, signal),
  surge: (elements, signal) => render(surge, elements, signal),
  quanx: (elements, signal) => render(quanx, elements, signal),
  loon: (elements, signal) => render(loon, elements, signal),
  surfboard: (elements, signal) => render(surfboard, elements, signal),
  stash: (elements, signal) => render(stash, elements, signal),
  singbox: (elements, signal) => render(singbox, elements, signal),
  ss,
  mixed,
  shadowrocket,
} satisfies Record<OutputTarget, (elements: OutputElements, signal: AbortSignal) => Promise<ConfigArtifact<object>>>;

export function generate(
  target: OutputTarget,
  elements: OutputElements,
  signal: AbortSignal,
): Promise<ConfigArtifact<object>> {
  return generators[target](elements, signal);
}
