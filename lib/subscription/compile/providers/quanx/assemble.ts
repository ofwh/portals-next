import { config } from './config';
import { nodes } from './node';
import { template } from './template';
import type { CompiledNode, CompileParams, CompileResult } from '../../types';

function renderNodes(nodes: readonly CompiledNode[]): string {
  if (!nodes.length) {
    return '';
  }

  const content = nodes.map((node) => node.content).join('\n');
  const sections = nodes
    .flatMap((node) => node.sections)
    .map((section) => {
      const entries = Object.entries(section.entries).map(([key, value]) => `${key} = ${String(value)}`);

      return [`[${section.name}]`, ...entries].join('\n');
    });

  return [`[server_local]\n${content}`, ...sections].join('\n\n');
}

export function assemble(input: CompileParams = {}): CompileResult {
  const compiledNodes = nodes.compileNodes(input.nodes, input.options);
  const hasConfig = !!input.config?.length;
  const compiledConfig = hasConfig ? config.compileConfig(input.config, compiledNodes) : undefined;
  const content =
    input.template !== undefined || hasConfig
      ? template.compileTemplate(input.template ?? '', compiledNodes, compiledConfig)
      : renderNodes(compiledNodes);

  return { target: nodes.type, nodes: compiledNodes, content };
}
