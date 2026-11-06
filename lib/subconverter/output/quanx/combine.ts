import type { OutputContext, OutputParts } from '../../types/output';
import { ini } from '../shared/ini';
import type { IniDocument, IniNodeProjection, IniRuleProjection } from '../shared/ini';

export function combine(
  parts: OutputParts<IniNodeProjection, IniRuleProjection, string[]>,
  context: OutputContext,
): IniDocument {
  return ini.combine(
    parts,
    { nodes: 'server_local', policies: 'policy', rules: 'filter_local', remote: 'filter_remote' },
    context,
  );
}
