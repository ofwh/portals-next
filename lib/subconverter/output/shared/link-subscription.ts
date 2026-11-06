import logger from '@/lib/api/logger';
import { OUTPUT_ERROR, OutputError } from './errors';
import { convertNodes, filterUnsupportedNodes } from './nodes';
import { ssNode } from './ss';
import { name, stringify } from './uri-links';
import { UriProvider } from '../../providers/uri';
import type { ConfigArtifact, OutputElements, OutputIssue } from '../../types/output';
import type { ProxyNodeFields } from '../../types/proxy-node';
import type { ProxyType } from '../../types/proxy-node/common';

type LinkTarget = 'ss' | 'mixed' | 'shadowrocket';

const mixed: readonly ProxyType[] = ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'hysteria2'];
const protocols: Record<LinkTarget, readonly ProxyType[]> = {
  ss: ['ss'],
  mixed,
  shadowrocket: [...mixed, 'hysteria', 'anytls', 'mieru'],
};

function compatibleNode(target: LinkTarget, node: ProxyNodeFields): ProxyNodeFields | undefined {
  if (target === 'ss') {
    return ssNode(node, target);
  }

  if (!protocols[target].includes(node.type)) {
    logger.warn(OUTPUT_ERROR.UNSUPPORTED_NODE_FOR_TARGET, {
      target,
      data: { id: node.id, name: node.name, type: node.type },
    });

    return undefined;
  }

  return node;
}

export function generate(target: LinkTarget, elements: OutputElements, signal: AbortSignal): ConfigArtifact<string[]> {
  signal.throwIfAborted();
  const issues: OutputIssue[] = [];
  const sourceIndices: number[] = [];
  const selected: ProxyNodeFields[] = [];

  for (const [index, node] of elements.nodes.entries()) {
    const fields = compatibleNode(target, node);

    if (!fields) {
      issues.push({ stage: 'node', index, field: 'type', message: OUTPUT_ERROR.UNSUPPORTED_NODE_FOR_TARGET });

      continue;
    }

    sourceIndices.push(index);
    selected.push(fields);
  }

  const provider = new UriProvider();
  let document: string[];

  try {
    const nodes = filterUnsupportedNodes(selected, (values) => {
      const result = convertNodes(values, (fields) => provider.transform('node', fields), name);

      return {
        ...result,
        entries: result.entries.map((entry) => ({ ...entry, value: stringify(entry.value, entry.sourceIndex) })),
      };
    });

    document = nodes.entries.map((entry) => entry.value);
    issues.push(
      ...nodes.issues.map((issue) => ({
        ...issue,
        ...(issue.index !== undefined && issue.index >= 0 ? { index: sourceIndices[issue.index] } : {}),
      })),
    );
  } catch (error) {
    if (error instanceof OutputError && sourceIndices[error.index] !== undefined) {
      throw new OutputError(error.stage, sourceIndices[error.index], error.field, error.message);
    }

    throw error;
  }

  signal.throwIfAborted();

  return {
    target,
    document,
    mediaType: 'text/plain',
    content: Buffer.from(document.length ? document.join('\n') + '\n' : '', 'utf8').toString('base64'),
    issues,
  };
}
