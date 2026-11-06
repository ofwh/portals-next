import type { supports } from '../../../providers/ini/transform';
import type { SupportedNodeFields } from '../../proxy-node/common';

export type IniNodeFields = SupportedNodeFields<(typeof supports)[number]>;
