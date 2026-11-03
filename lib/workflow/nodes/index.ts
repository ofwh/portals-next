import 'server-only';
import commonGroups from './common';
import configurationGroups from './configuration';
import { registerNodeGroups } from './core/registry';
import subscriptionGroups from './subscription';

registerNodeGroups([...subscriptionGroups, ...configurationGroups, ...commonGroups]);

export {
  defineNode,
  getNode,
  nodeRegistry,
  registerNode,
  registerNodeGroup,
  registerNodeGroups,
} from './core/registry';
