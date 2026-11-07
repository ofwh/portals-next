import 'server-only';
import { registerNodeGroups } from './core/registry';
import commonGroups from '../flows/general';
import proxyGroups from '../flows/proxies';

registerNodeGroups([...commonGroups, ...proxyGroups]);

export {
  defineNode,
  getNode,
  nodeRegistry,
  registerNode,
  registerNodeGroup,
  registerNodeGroups,
} from './core/registry';
