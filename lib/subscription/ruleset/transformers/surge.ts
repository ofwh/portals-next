import { defineTransformer } from './shared';
import { surgeResolver } from '../resolvers/surge';

export const surgeTransformer = defineTransformer({
  type: 'surge',
  resolvers: [surgeResolver],
  inlineResolver: surgeResolver,
});
