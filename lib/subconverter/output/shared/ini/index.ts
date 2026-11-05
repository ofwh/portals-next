import { combine } from './combine';
import { projectNode } from './nodes';
import { groupLine, projectPolicies } from './policies';
import { basicRuleTypes, projectRules } from './rules';
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
