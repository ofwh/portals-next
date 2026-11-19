import { config } from './config';
import { nodes } from './node';
import { template } from './template';
import type { CompiledNode, CompileParams, CompileResult, Source } from '../../types';

function renderNodes(nodes: readonly CompiledNode[]): string {
  if (!nodes.length) {
    return '';
  }

  const collections: Record<string, Source[]> = {};

  for (const node of nodes) {
    (collections[node.collection ?? 'outbounds'] ??= []).push(node.value);
  }

  return JSON.stringify(collections);
}

export function assemble(input: CompileParams = {}): CompileResult {
  const compiledNodes = nodes.compileNodes(input.nodes, input.options);
  const hasConfig = !!input.config?.length;
  const compiledConfig = hasConfig ? config.compileConfig(input.config, compiledNodes) : undefined;
  const content =
    input.template !== undefined || hasConfig
      ? template.compileTemplate(input.template ?? '{}', compiledNodes, compiledConfig)
      : renderNodes(compiledNodes);

  return { target: nodes.type, nodes: compiledNodes, content };
}
