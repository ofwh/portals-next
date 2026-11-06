import 'server-only';
import { registerNodeGroups } from './core/registry';
import commonGroups from '../flows/general';

registerNodeGroups(commonGroups);

export {
  defineNode,
  getNode,
  nodeRegistry,
  registerNode,
  registerNodeGroup,
  registerNodeGroups,
} from './core/registry';
