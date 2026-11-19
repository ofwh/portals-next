import { schema } from './schema';
import { defineNodes } from '../shared';

export const nodes = defineNodes({
  type: 'singbox',
  schema,
  prepare: (source) => ({ ...source, name: source.name.replaceAll('=', '-') }),
  serialize: (value, definition) => ({
    content: JSON.stringify(value),
    sections: [],
    collection: definition.collection ?? 'outbounds',
  }),
});
