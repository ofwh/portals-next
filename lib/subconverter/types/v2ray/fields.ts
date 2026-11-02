import type { supports } from '../../providers/v2ray/transform';
import type { SupportedNodeFields } from '../common';

export type V2RayNodeFields = SupportedNodeFields<(typeof supports)[number]>;
