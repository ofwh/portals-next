import logger from '@/lib/api/logger';
import { OUTPUT_ERROR } from './errors';
import type { ProxyNodeFields } from '../../types/proxy-node';

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

export function ssNode(node: ProxyNodeFields, target: 'ss' | 'sssub'): ProxyNodeFields | undefined {
  if (node.type === 'ssr') {
    if (node.protocol !== 'origin' || node.obfs !== 'plain' || !ssCiphers.has(node.cipher)) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_NODE_FOR_TARGET, {
        target,
        data: {
          id: node.id,
          name: node.name,
          type: node.type,
          protocol: node.protocol,
          obfs: node.obfs,
          cipher: node.cipher,
        },
      });

      return undefined;
    }

    const fields = { ...node };

    for (const key of ['protocol', 'protocolParam', 'obfs', 'obfsParam']) {
      Reflect.deleteProperty(fields, key);
    }

    return { ...fields, type: 'ss' };
  }

  if (node.type !== 'ss') {
    logger.warn(OUTPUT_ERROR.UNSUPPORTED_NODE_FOR_TARGET, {
      target,
      data: { id: node.id, name: node.name, type: node.type },
    });

    return undefined;
  }

  return node;
}
