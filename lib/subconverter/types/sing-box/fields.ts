import type { supports } from '../../providers/sing-box/transform';
import type { SupportedNodeFields } from '../common';

export type SingBoxNodeFields = SupportedNodeFields<(typeof supports)[number]>;
