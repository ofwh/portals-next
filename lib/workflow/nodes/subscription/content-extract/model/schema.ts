import { appError } from '@/lib/api';
import { proxyNodeTypes } from '@/lib/types/subscriptions/nodes';
import type { ParsedProxyNode } from '@/lib/types/subscriptions/nodes';
import { parameterDefaults } from './defaults';
import { formats } from './definition';
import type { ContentExtractConfig } from './types';
import { isRecord } from '../../../../utils';
import { stringValue } from '../../../core/schemas';
import type { NamedType, Parser } from '../../../types';

export function isConfig(value: unknown): value is ContentExtractConfig {
  return (
    isRecord(value) &&
    formats.some((format) => format === value.format) &&
    Object.keys(value).every((key) => key === 'format')
  );
}

export const configSchema: Parser<ContentExtractConfig> = {
  parse(value) {
    if (!isConfig(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return { format: value.format };
  },
};
export const inputSchema = stringValue;
export const outputSchema: NamedType<ParsedProxyNode[]> = {
  descriptor: { kind: 'ref', id: 'subscription.extended-nodes', version: 1 },
  base: { kind: 'array', items: { kind: 'record', values: { kind: 'any' } } },
  parse(value) {
    if (!Array.isArray(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    for (const node of value as unknown[]) {
      if (!isRecord(node) || !proxyNodeTypes.some((type) => type === node.type)) {
        throw appError('common.INVALID_PARAMS');
      }

      for (const [key, fallback] of Object.entries(parameterDefaults)) {
        const field = node[key];

        if (
          fallback === null
            ? field !== null && typeof field !== 'boolean'
            : Array.isArray(fallback)
              ? !Array.isArray(field) ||
                !field.every((item: unknown) => {
                  if (key === 'xrayLinkOptions') {
                    return Array.isArray(item) && item.length === 2 && item.every((part) => typeof part === 'string');
                  }

                  if (key === 'wireGuardPeers') {
                    return (
                      isRecord(item) &&
                      ['hostname', 'publicKey', 'preSharedKey', 'allowedIPs', 'reserved'].every(
                        (name) => typeof item[name] === 'string',
                      ) &&
                      ['port', 'keepAlive'].every(
                        (name) => typeof item[name] === 'number' && Number.isInteger(item[name]),
                      )
                    );
                  }

                  return typeof item === 'string';
                })
              : typeof field !== typeof fallback
        ) {
          throw appError('common.INVALID_PARAMS');
        }
      }
      for (const field of Object.values(node)) {
        if (typeof field === 'number' && (!Number.isFinite(field) || field < 0)) {
          throw appError('common.INVALID_PARAMS');
        }
      }
      if (!node.hostname || !Number.isInteger(node.port) || Number(node.port) < 1 || Number(node.port) > 65535) {
        throw appError('common.INVALID_PARAMS');
      }
    }

    return value as ParsedProxyNode[];
  },
};
