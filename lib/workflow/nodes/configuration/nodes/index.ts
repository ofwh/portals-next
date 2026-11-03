import { policyGroupsNode } from './policies';
import { ruleGroupsNode } from './rulesets';

export { ruleGroupsNode, policyGroupsNode };

const nodes = [ruleGroupsNode, policyGroupsNode] as const;

export default nodes;
