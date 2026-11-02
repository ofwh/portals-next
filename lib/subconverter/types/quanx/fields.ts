import type { supports } from '../../providers/quanx/transform';
import type { SupportedNodeFields } from '../common';

export type QuanXNodeFields = SupportedNodeFields<(typeof supports)[number]>;
