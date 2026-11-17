import { stringify } from 'yaml';
import { schema } from './schema';
import { defineNodes } from '../shared';

export const nodes = defineNodes({
  type: 'clash',
  schema,
  prepare: (source) => ({ ...source, name: source.name.replaceAll('=', '-') }),
  serialize: (value) => ({ content: stringify(value).trimEnd(), sections: [] }),
});
