import { schema } from './schema';
import { validate } from './validation';
import { serialize } from '../../shared/ini';
import { defineNodes } from '../shared';

export const nodes = defineNodes({
  type: 'loon',
  schema,
  prepare: (source) => ({ ...source, name: source.name.replaceAll('=', '-') }),
  validate,
  serialize: (value, definition) => serialize(value, definition, ','),
});
