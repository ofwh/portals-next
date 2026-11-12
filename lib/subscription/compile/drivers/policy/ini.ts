import { loonGroups } from './loon';
import { quanxGroups } from './quanx';
import { surfboardGroups } from './surfboard';
import { surgeGroups } from './surge';
import type { CompileTarget } from '../../../types/compile';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { CompileError } from '../../diagnostics';
import type { CompileContext } from '../../types';

const groupDrivers: Partial<Record<CompileTarget, typeof quanxGroups>> = {
  loon: loonGroups,
  quanx: quanxGroups,
  surfboard: surfboardGroups,
  surge: surgeGroups,
};

export function iniGroups(context: CompileContext, nodes: ProxyNode[], document: IniDocument): void {
  const driver = groupDrivers[context.target];

  if (!driver) {
    throw new CompileError('INVALID_TARGET', 'target');
  }

  driver(context, nodes, document);
}
