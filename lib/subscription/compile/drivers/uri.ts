import { clientLink, shareLink } from './nodes';
import { base64 } from './shared';
import { warn } from '../diagnostics';
import type { CompileContext } from '../types';

export function compileUri(context: CompileContext): string {
  let output = '';

  for (const [index, node] of context.nodes.entries()) {
    const value =
      context.target === 'mixed'
        ? shareLink(node)
        : clientLink(node, context.target === 'v2rayn' ? 'v2rayn' : 'v2rayng');

    if (!context.protocols.includes(node.protocol) || value === undefined) {
      warn(context, 'UNSUPPORTED_NODE', 'nodes', index);
    } else {
      output += `${value}\n`;
    }
  }

  return base64(output);
}
