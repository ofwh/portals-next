import { stringify } from 'yaml';
import { config } from './config';
import { nodes } from './node';
import { template } from './template';
import type { CompiledNode, CompileParams, CompileResult } from '../../types';

function renderNodes(nodes: readonly CompiledNode[]): string {
  return nodes.length ? stringify({ proxies: nodes.map((node) => node.value) }).trimEnd() : '';
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
