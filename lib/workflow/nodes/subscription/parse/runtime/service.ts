import 'server-only';
import { appError } from '@/lib/api';
import { tryDecodeBase64Utf8 } from './encoding';
import { formatParsers } from './providers';
import { extractLinks } from './providers/links';
import { normalizeSubscriptionNode } from '../../schema';
import type { SubscriptionNode } from '../../types';
import type { SubscriptionFormat } from '../model/types';

function extractAuto(content: string, allowBase64 = true): unknown[] {
  const text = content.replace(/^\uFEFF/, '').trim();
  const parser = Object.values(formatParsers).find((strategy) => strategy.matches(text));

  if (parser) {
    return parser.extract(text);
  }

  if (allowBase64) {
    const decoded = tryDecodeBase64Utf8(text);

    if (decoded) {
      return extractAuto(decoded, false);
    }
  }

  return [];
}

export function parseSubscription(content: string, format: SubscriptionFormat): SubscriptionNode[] {
  try {
    const text = content.replace(/^\uFEFF/, '').trim();
    const raw =
      format === 'auto'
        ? extractAuto(text)
        : format === 'base64'
          ? extractLinks(tryDecodeBase64Utf8(text) ?? text)
          : formatParsers[format].extract(text);
    const usedNames = new Set<string>();
    const nodes: SubscriptionNode[] = [];

    for (const item of raw) {
      const node = normalizeSubscriptionNode(item);

      if (!node) {
        continue;
      }

      const baseName = node.name
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 256);

      if (!baseName) {
        continue;
      }

      let name = baseName;
      let occurrence = 1;

      while (usedNames.has(name)) {
        name = `${baseName} #${++occurrence}`;
      }
      usedNames.add(name);
      nodes.push({ ...node, name });
    }
    if (!nodes.length) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    return nodes;
  } catch {
    throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
  }
}

const service = { parseSubscription };

export default service;
