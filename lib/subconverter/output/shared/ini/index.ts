import { groupLine, projectPolicies } from '@/lib/subconverter/policies/output/ini';
import { basicRuleTypes, projectRules } from '@/lib/subconverter/rulesets/output/ini';
import { combine } from './combine';
import { projectNode } from './nodes';
import { stringify } from './stringify';
import { token } from './token';

export type { IniDocument, IniNodeProjection, IniRuleProjection } from './types';

export const ini = {
  token,
  projectNode,
  projectPolicies,
  groupLine,
  basicRuleTypes,
  projectRules,
  combine,
  stringify,
};
