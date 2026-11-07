import 'server-only';
import { registerNodeGroups } from './core/registry';
import configurationGroups from '../flows/configuration';
import commonGroups from '../flows/general';
import proxyGroups from '../flows/proxies';

registerNodeGroups([...commonGroups, ...proxyGroups, ...configurationGroups]);

export {
  defineNode,
  getNode,
  nodeRegistry,
  registerNode,
  registerNodeGroup,
  registerNodeGroups,
} from './core/registry';
