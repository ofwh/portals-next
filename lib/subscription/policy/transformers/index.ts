import { clashTransformer } from './clash';
import { loonTransformer } from './loon';
import { quanTransformer } from './quan';
import { quanxTransformer } from './quanx';
import { singboxTransformer } from './singbox';
import { stashTransformer } from './stash';
import { surfboardTransformer } from './surfboard';
import { surgeTransformer } from './surge';
import type { PolicyTransformerModule } from './types';
import type { PolicyTransformer } from '../../types/policy';

export const policyTransformers: Record<PolicyTransformer, PolicyTransformerModule> = {
  surge: surgeTransformer,
  surfboard: surfboardTransformer,
  clash: clashTransformer,
  stash: stashTransformer,
  quan: quanTransformer,
  quanx: quanxTransformer,
  loon: loonTransformer,
  singbox: singboxTransformer,
};
export const policyTransformerOptions = Object.values(policyTransformers).map(({ type, label }) => ({
  value: type,
  label,
}));

export function isPolicyTransformer(value: unknown): value is PolicyTransformer {
  return typeof value === 'string' && Object.hasOwn(policyTransformers, value);
}

export {
  surgeTransformer,
  surfboardTransformer,
  clashTransformer,
  stashTransformer,
  quanTransformer,
  quanxTransformer,
  loonTransformer,
  singboxTransformer,
};
