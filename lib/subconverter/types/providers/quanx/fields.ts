import type { supports } from '../../../providers/quanx/transform';
import type { SupportedNodeFields } from '../../proxy-node/common';

export type QuanXNodeFields = SupportedNodeFields<(typeof supports)[number]>;
