import { clashTransformer } from './clash';
import { quanxTransformer } from './quanx';
import { surgeTransformer } from './surge';
import type { RulesetTransformerModule } from './types';
import type { RulesetTransformer } from '../../types/ruleset';

export const rulesetTransformers: Record<RulesetTransformer, RulesetTransformerModule> = {
  surge: surgeTransformer,
  quanx: quanxTransformer,
  clash: clashTransformer,
};

export { surgeTransformer, quanxTransformer, clashTransformer };
export { rulesetTransformerOptions, isRulesetTransformer, getRulesetTransformer } from './options';
