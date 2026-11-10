import { clashTransformer } from './clash';
import { quanxTransformer } from './quanx';
import { singboxTransformer } from './singbox';
import { surgeTransformer } from './surge';
import type { RulesetTransformerModule } from './types';
import type { RulesetTransformer } from '../../types/ruleset';

export const rulesetTransformers: Record<RulesetTransformer, RulesetTransformerModule> = {
  surge: surgeTransformer,
  quanx: quanxTransformer,
  clash: clashTransformer,
  singbox: singboxTransformer,
};

export { surgeTransformer, quanxTransformer, clashTransformer, singboxTransformer };
export { rulesetTransformerOptions, isRulesetTransformer, getRulesetTransformer } from './options';
