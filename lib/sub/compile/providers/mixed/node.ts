import { isRecord } from '@/lib/shared/data';
import { schema } from './schema';
import { base64 } from './shared';
import { host } from '../../shared';
import type { Source } from '../../types';
import { defineNodes } from '../shared';

function query(value: Source): string {
  const items = Object.entries(value)
    .filter(([, entry]) => entry !== undefined && entry !== '')
    .map(([key, entry]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(entry))}`);

  return items.length ? `?${items.join('&')}` : '';
}

export const nodes = defineNodes({
  type: 'mixed',
  nodes: schema,
  serialize: (value) => {
    const scheme = String(value.scheme);
    const address = `${host(String(value.server))}:${String(value.port)}`;
    const suffix = value.name ? `#${encodeURIComponent(String(value.name))}` : '';
    const params = isRecord(value.query) ? value.query : {};
    let content: string;

    if (scheme === 'vmess') {
      content = `vmess://${base64(JSON.stringify(value.payload))}`;
    } else if (scheme === 'ssr') {
      // SSR 的空参数仍须保留，不能使用忽略空值的通用 query 序列化。
      const queryString = Object.entries(params)
        .map(([key, entry]) => `${key}=${String(entry)}`)
        .join('&');

      content = `ssr://${base64(`${String(value.server)}:${String(value.port)}:${String(value.protocol)}:${String(value.method)}:${String(value.obfs)}:${String(value.password)}/?${queryString}`, true)}`;
    } else if (scheme === 'ss') {
      content = `ss://${String(value.credential)}@${address}${Object.keys(params).length ? `/${query(params)}` : ''}${suffix}`;
    } else if (scheme === 'hysteria2' && value.realm) {
      const realm = String(value.realm);
      const parameters = query(params);

      content = `hysteria2+${realm}${realm.includes('?') ? parameters.replace('?', '&') : parameters}${suffix}`;
    } else {
      const credentials =
        scheme === 'vless'
          ? `${String(value.credential)}@`
          : value.credential !== undefined
            ? `${encodeURIComponent(String(value.credential))}@`
            : '';

      content = `${scheme}://${credentials}${address}${scheme === 'hysteria2' ? '/' : ''}${query(params)}${suffix}`;
    }

    return { content, sections: [] };
  },
});
