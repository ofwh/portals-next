import 'server-only';
import commonGroups from './common';
import { registerNodeGroups } from './core/registry';
import subscriptionGroups from './subscription';

registerNodeGroups([...subscriptionGroups, ...commonGroups]);

export {
  defineNode,
  getNode,
  nodeRegistry,
  registerNode,
  registerNodeGroup,
  registerNodeGroups,
} from './core/registry';
