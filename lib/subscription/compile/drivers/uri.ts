import { shareLink } from './nodes';
import { base64 } from './shared';
import { warn } from '../diagnostics';
import type { CompileContext } from '../types';

export function compileUri(context: CompileContext): string {
  let output = '';

  for (const [index, node] of context.nodes.entries()) {
    const value = shareLink(node);

    if (!context.protocols.includes(node.protocol) || value === undefined) {
      warn(context, 'UNSUPPORTED_NODE', 'nodes', index);
    } else {
      output += `${value}\n`;
    }
  }

  return base64(output);
}
