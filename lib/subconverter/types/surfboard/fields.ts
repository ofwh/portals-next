import type { supports } from '../../providers/surfboard/transform';
import type { SupportedNodeFields } from '../common';

export type SurfboardNodeFields = SupportedNodeFields<(typeof supports)[number]>;
