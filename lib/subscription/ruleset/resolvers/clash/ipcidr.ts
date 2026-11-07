import { parseClashPayloadValue } from './shared';
import { RULESET_ERROR_CODES } from '../../../shared/errors';
import { EntryError } from '../../diagnostics';
import { parseCommonRule, stripComment } from '../../rule';
import { resolveDeclaration } from '../shared';
import type { RulesetResolverModule } from '../types';

const parse: RulesetResolverModule['parse'] = (input) => {
  const rule = parseClashPayloadValue(stripComment(input, true));

  if (!rule) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
  }

  return rule;
};

export const clashIpcidrResolver: RulesetResolverModule = {
  category: 'clash-ipcidr',
  payload: true,
  parse,
  parseInline: parseCommonRule,
  resolve: (declaration) => resolveDeclaration(declaration, clashIpcidrResolver),
};
