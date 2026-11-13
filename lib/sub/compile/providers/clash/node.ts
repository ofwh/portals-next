import { stringify } from 'yaml';
import { schema } from './schema';
import { defineNodes } from '../shared';

export const nodes = defineNodes({
  type: 'clash',
  nodes: schema,
  serialize: (value) => ({ content: stringify(value).trimEnd(), sections: [] }),
});
