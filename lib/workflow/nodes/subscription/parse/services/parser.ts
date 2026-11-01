import 'server-only';
import { parseDocument } from 'yaml';
import { appError } from '@/lib/api';
import { convertSingBoxOutbound } from './sing-box';
import { parseShareLink } from './vendor/links';
import { isRecord } from '../../../../utils';
import { normalizeSubscriptionNode } from '../../schema';
import type { SubscriptionNode } from '../../types';
import type { FormatParser, SubscriptionFormat } from '../types';
import { tryDecodeBase64Utf8 } from '../utils';

function extractLinks(content: string): unknown[] {
  return content.split(/\r?\n/).flatMap((line) => {
    const node = parseShareLink(line);

    return node ? [node] : [];
  });
}

const formatParsers = {
  'sing-box': {
    matches(content) {
      try {
        const value: unknown = JSON.parse(content);

        return isRecord(value)
          ? 'outbounds' in value
          : Array.isArray(value) && value.some((item: unknown) => isRecord(item) && 'server_port' in item);
      } catch {
        return false;
      }
    },
    extract(content) {
      const value: unknown = JSON.parse(content);
      const outbounds = Array.isArray(value) ? value : isRecord(value) ? value.outbounds : undefined;

      if (!Array.isArray(outbounds)) {
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
      }

      return outbounds.map(convertSingBoxOutbound).filter((node) => node !== undefined);
    },
  },
  clash: {
    matches(content) {
      return /^[\[{]/.test(content) || /(^|\n)\s*(proxies|Proxy)\s*:/.test(content);
    },
    extract(content) {
      const document = parseDocument(content, { merge: false, uniqueKeys: true });

      if (document.errors.length) {
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
      }

      const value: unknown = document.toJS({ maxAliasCount: 20 });
      const proxies = Array.isArray(value) ? value : isRecord(value) ? (value.proxies ?? value.Proxy) : undefined;

      if (!Array.isArray(proxies)) {
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
      }

      return proxies;
    },
  },
  links: {
    matches: (content) => /(^|\n)\s*[a-z][a-z0-9+.-]*:\/\//i.test(content),
    extract: extractLinks,
  },
} satisfies Record<Exclude<SubscriptionFormat, 'auto' | 'base64'>, FormatParser>;

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
