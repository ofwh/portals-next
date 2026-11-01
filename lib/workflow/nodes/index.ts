import 'server-only';
import { group as commonGroup } from './common';
import { registerNodeGroup } from './core/registry';
import { group as subscriptionGroup } from './subscription';

registerNodeGroup(subscriptionGroup);
registerNodeGroup(commonGroup);

export { defineNode, getNode, nodeRegistry, registerNode, registerNodeGroup } from './core/registry';
