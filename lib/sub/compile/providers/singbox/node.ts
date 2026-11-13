import { schema } from './schema';
import { defineNodes } from '../shared';

export const nodes = defineNodes({
  type: 'singbox',
  nodes: schema,
  serialize: (value) => ({ content: JSON.stringify(value), sections: [] }),
});
