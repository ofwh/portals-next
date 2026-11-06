import type { NodeFieldsBase } from '../common';

export interface SudokuNodeFields extends NodeFieldsBase {
  type: 'sudoku';
  port: number;
  server: string;
  aeadMethod?: string;
  customTable?: string;
  customTables?: Array<string>;
  underlyingProxy?: string;
  enablePureDownlink?: boolean;
  httpMask?: boolean;
  httpMaskHost?: string;
  httpMaskMode?: string;
  httpMaskMultiplex?: string;
  httpMaskTls?: boolean;
  httpmaskDisable?: boolean;
  httpmaskMode?: string;
  httpmaskTls?: boolean;
  httpmaskHost?: string;
  httpmaskPathRoot?: string;
  httpmaskMultiplex?: string;
  interfaceName?: string;
  ipVersion?: string;
  key?: string;
  mptcp?: boolean;
  multiplex?: string;
  paddingMax?: number;
  paddingMin?: number;
  pathRoot?: string;
  routingMark?: number;
  tableType?: string;
  tcpFastOpen?: boolean;
}
