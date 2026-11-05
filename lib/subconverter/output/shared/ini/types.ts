import type { IniSection } from '../../../types/providers/ini';

export interface IniNodeProjection {
  lines: string[];
  sections: IniSection[];
}
export interface IniRuleProjection {
  local: string[];
  remote: string[];
}
export interface IniDocument {
  sections: IniSection[];
}
