import { clashTransformer } from './clash';
import { loonTransformer } from './loon';
import { quanxTransformer } from './quanx';
import { singboxTransformer } from './singbox';
import { surgeTransformer } from './surge';
import type { RulesetTransformerModule } from './types';
import type { RulesetTransformer } from '../../types/ruleset';

export const rulesetTransformers: Record<RulesetTransformer, RulesetTransformerModule> = {
  surge: surgeTransformer,
  loon: loonTransformer,
  quanx: quanxTransformer,
  clash: clashTransformer,
  singbox: singboxTransformer,
};

export { surgeTransformer, loonTransformer, quanxTransformer, clashTransformer, singboxTransformer };
export { rulesetTransformerOptions, isRulesetTransformer, getRulesetTransformer } from './options';
