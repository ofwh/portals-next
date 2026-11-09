import { compileTargets } from '../../shared/compile';
import type { CompileTarget } from '../../types/compile';
import { compileClash, compileIni, compileSingbox, compileUri } from '../drivers';
import { clashProtocols, clientProtocols, iniProtocols, mixedProtocols, singboxProtocols } from '../drivers/nodes';
import type { CompileTransformer } from '../types';

export const compileTransformers: Record<CompileTarget, CompileTransformer> = {
  mixed: { ...compileTargets.mixed, type: 'mixed', protocols: mixedProtocols, compile: compileUri },
  clash: { ...compileTargets.clash, type: 'clash', protocols: clashProtocols, compile: compileClash },
  loon: { ...compileTargets.loon, type: 'loon', protocols: iniProtocols.loon, compile: compileIni },
  singbox: { ...compileTargets.singbox, type: 'singbox', protocols: singboxProtocols, compile: compileSingbox },
  quanx: { ...compileTargets.quanx, type: 'quanx', protocols: iniProtocols.quanx, compile: compileIni },
  surge: { ...compileTargets.surge, type: 'surge', protocols: iniProtocols.surge, compile: compileIni },
  surfboard: {
    ...compileTargets.surfboard,
    type: 'surfboard',
    protocols: iniProtocols.surfboard,

    compile: compileIni,
  },
  mellow: { ...compileTargets.mellow, type: 'mellow', protocols: iniProtocols.mellow, compile: compileIni },
  v2rayn: { ...compileTargets.v2rayn, type: 'v2rayn', protocols: clientProtocols, compile: compileUri },
  v2rayng: { ...compileTargets.v2rayng, type: 'v2rayng', protocols: clientProtocols, compile: compileUri },
};

export { compileTargetOptions, isCompileTarget } from '../../shared/compile';
