import { defineTransformer } from './shared';
import { quanxResolver } from '../resolvers/quanx';

export const quanxTransformer = defineTransformer({
  type: 'quanx',
  resolvers: [quanxResolver],
  inlineResolver: quanxResolver,
});
