import { Buffer } from 'node:buffer';
import { nodes } from './node';
import { ConfigCompileError } from '../../shared/config';
import type { CompiledNode, CompileParams, CompileResult } from '../../types';

function renderNodes(nodes: readonly CompiledNode[]): string {
  return nodes.length
    ? Buffer.from(`${nodes.map((node) => node.content).join('\n')}\n`, 'utf8').toString('base64')
    : '';
}

export function assemble(input: CompileParams = {}): CompileResult {
  if (input.config?.length) {
    throw new ConfigCompileError(nodes.type, 'Configuration output is not supported');
  }

  const compiledNodes = nodes.compileNodes(input.nodes, input.options);

  return { target: nodes.type, nodes: compiledNodes, content: renderNodes(compiledNodes) };
}
