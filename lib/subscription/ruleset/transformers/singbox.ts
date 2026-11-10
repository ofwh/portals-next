import { rulesetTransformerLabels } from './options';
import type { RulesetTransformerModule } from './types';
import { readSingboxDeclaration } from '../declarations/singbox';
import { rulesetResolvers } from '../resolvers';
import { resolveSingboxRemote, singboxInlineResolver } from '../resolvers/singbox';

export const singboxTransformer: RulesetTransformerModule = {
  type: 'singbox',
  label: rulesetTransformerLabels.singbox,
  resolvers: Object.values(rulesetResolvers),
  inlineResolver: singboxInlineResolver,
  transform(input, format, id) {
    const declaration = readSingboxDeclaration(input, format, id);

    if (declaration.category === 'singbox') {
      return resolveSingboxRemote(declaration);
    }

    if (declaration.source.kind === 'inline') {
      return singboxInlineResolver.resolve(declaration);
    }

    return rulesetResolvers[declaration.category ?? 'surge'].resolve(declaration);
  },
};
