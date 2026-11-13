import { schema } from './schema';
import { defineNodes, serialize } from '../shared';

export const nodes = defineNodes({
  type: 'loon',
  nodes: schema,
  serialize: (value, definition) => serialize(value, definition, ','),
});
