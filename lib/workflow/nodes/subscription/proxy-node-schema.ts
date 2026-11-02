import { appError } from '@/lib/api';
import { validateFields } from '@/lib/subconverter/mapping';
import type { ProxyNodeFields } from '@/lib/subconverter/types';
import { assertJson } from '../../utils';
import { arrayOf } from '../core/schemas';
import type { NamedType } from '../types';

export const proxyNodeSchema: NamedType<ProxyNodeFields> = {
  descriptor: { kind: 'ref', id: 'subscription.proxy-node-fields', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    assertJson(value);
    try {
      const node: unknown = JSON.parse(JSON.stringify(validateFields(value)));

      assertJson(node);

      return node as ProxyNodeFields;
    } catch {
      throw appError('common.INVALID_PARAMS');
    }
  },
};
export const proxyNodesSchema = arrayOf(proxyNodeSchema);
