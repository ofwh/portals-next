import { OutputError } from './errors';
import { convertNodes, filterUnsupportedNodes } from './nodes';
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
const ssCiphers = new Set([
  'rc4-md5',
  'aes-128-gcm',
  'aes-192-gcm',
  'aes-256-gcm',
  'aes-128-cfb',
  'aes-192-cfb',
  'aes-256-cfb',
  'aes-128-ctr',
  'aes-192-ctr',
  'aes-256-ctr',
  'camellia-128-cfb',
  'camellia-192-cfb',
  'camellia-256-cfb',
  'bf-cfb',
  'chacha20-ietf-poly1305',
  'xchacha20-ietf-poly1305',
  'salsa20',
  'chacha20',
  'chacha20-ietf',
  '2022-blake3-aes-128-gcm',
  '2022-blake3-aes-256-gcm',
  '2022-blake3-chacha20-poly1305',
  '2022-blake3-chacha12-poly1305',
  '2022-blake3-chacha8-poly1305',
]);

function compatibleNode(target: LinkTarget, node: ProxyNodeFields): ProxyNodeFields | undefined {
  if (target === 'ss' && node.type === 'ssr') {
    if (node.protocol !== 'origin' || node.obfs !== 'plain' || !ssCiphers.has(node.cipher)) {
      return undefined;
    }

    const fields = { ...node };

    for (const key of ['protocol', 'protocolParam', 'obfs', 'obfsParam']) {
      Reflect.deleteProperty(fields, key);
    }

    return { ...fields, type: 'ss' };
  }

  return protocols[target].includes(node.type) ? node : undefined;
}

export function generate(target: LinkTarget, elements: OutputElements, signal: AbortSignal): ConfigArtifact<string[]> {
  signal.throwIfAborted();
  const issues: OutputIssue[] = [];
  const sourceIndices: number[] = [];
  const selected: ProxyNodeFields[] = [];

  for (const [index, node] of elements.nodes.entries()) {
    const fields = compatibleNode(target, node);

    if (!fields) {
      issues.push({ stage: 'node', index, field: 'type', message: 'unsupported-node-for-target' });

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
