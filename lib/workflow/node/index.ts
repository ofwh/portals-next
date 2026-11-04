import 'server-only';
import { registerNodeGroups } from './core/registry';
import configurationGroups from '../flows/configuration';
import commonGroups from '../flows/general';
import subscriptionGroups from '../flows/subscription';

registerNodeGroups([...subscriptionGroups, ...configurationGroups, ...commonGroups]);

export {
  defineNode,
  getNode,
  nodeRegistry,
  registerNode,
  registerNodeGroup,
  registerNodeGroups,
} from './core/registry';
