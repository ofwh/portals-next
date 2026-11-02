import type { supports } from '../../providers/ini/transform';
import type { SupportedNodeFields } from '../common';

export type IniNodeFields = SupportedNodeFields<(typeof supports)[number]>;
