import { defineTransformer } from './shared';
import { loonResolver } from '../resolvers/loon';

export const loonTransformer = defineTransformer({
  type: 'loon',
  resolvers: [loonResolver],
  inlineResolver: loonResolver,
});
