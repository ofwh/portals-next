import { isRecord } from '@/lib/shared/data';
import { schema } from './schema';
import { host } from '../../shared';
import { defineNodes } from '../shared';

export const nodes = defineNodes({
  type: 'quanx',
  nodes: schema,
  serialize: (value) => {
    const excluded = new Set(['name', 'type', 'server', 'port']);
    const options = Object.entries(value)
      .filter(([key]) => !excluded.has(key))
      .map(([key, entry]) => `${key}=${isRecord(entry) ? JSON.stringify(entry) : String(entry)}`);

    const name = String(value.name);
    const tag = name.includes(',') && !name.startsWith('"') ? `"${name}"` : name;

    return {
      content: `${String(value.type)} = ${host(String(value.server))}:${String(value.port)}, ${[...options, `tag=${tag}`].join(', ')}`,
      sections: [],
    };
  },
});
