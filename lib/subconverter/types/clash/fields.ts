import type { supports } from '../../providers/clash/transform';
import type { SupportedNodeFields } from '../common';

export type ClashNodeFields = SupportedNodeFields<(typeof supports)[number]>;
