import type { ProxyNodeFields } from './fields';

type Keys<T> = T extends object ? keyof T : never;

export type FieldName = Keys<ProxyNodeFields>;
export type Codec =
  | 'port'
  | 'number'
  | 'boolean'
  | 'duration'
  | 'bandwidth'
  | 'ports'
  | 'headersSingle'
  | 'headersList'
  | 'hostHeaders'
  | 'ipv4'
  | 'ipv6'
  | 'clashPeers'
  | 'singBoxPeers'
  | 'endpointPeers'
  | 'single'
  | 'seconds'
  | 'booleanText'
  | 'numberText'
  | 'list'
  | 'text'
  | 'strings'
  | 'tlsMode'
  | 'grpcMode'
  | 'comma'
  | 'hostHeaderSingle'
  | 'iniHeaders';

export interface Binding {
  path: string;
  field: FieldName;
  codec?: Codec;
  network?: string;
}
