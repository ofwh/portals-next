import { schema } from './schema';
import { validate } from './validation';
import { serialize } from '../../shared/ini';
import { defineNodes } from '../shared';
import { sections } from '../surge/sections';

export const nodes = defineNodes({
  type: 'surfboard',
  schema,
  prepare: (source) => ({ ...source, name: source.name.replaceAll('=', '-') }),
  validate,
  serialize: (value, definition) => ({ ...serialize(value, definition), sections: sections(value) }),
});
