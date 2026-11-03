export interface V2RayProxyNodeSettingsVnextItemUsersItem {
  id: string;
  alterId?: number;
  security?: string;
}

export interface V2RayProxyNodeSettingsVnextItem {
  address: string;
  port: string | number;
  users: Array<V2RayProxyNodeSettingsVnextItemUsersItem>;
}

export interface V2RayProxyNodeSettings {
  vnext: Array<V2RayProxyNodeSettingsVnextItem>;
}

export interface V2RayProxyNodeStreamSettingsTcpSettingsHeaderRequestHeadersItem {
  name: string;
  value: string | Array<string>;
}

export interface V2RayProxyNodeStreamSettingsTcpSettingsHeaderRequest {
  path?: Array<string>;
  headers?: Array<V2RayProxyNodeStreamSettingsTcpSettingsHeaderRequestHeadersItem>;
  version?: string;
  method?: string;
}

export interface V2RayProxyNodeStreamSettingsTcpSettingsHeaderResponse {
  version?: string;
  status?: string;
  reason?: string;
  headers?: Array<V2RayProxyNodeStreamSettingsTcpSettingsHeaderRequestHeadersItem>;
}

export interface V2RayProxyNodeStreamSettingsTcpSettingsHeader {
  type?: string;
  request?: V2RayProxyNodeStreamSettingsTcpSettingsHeaderRequest;
  response?: V2RayProxyNodeStreamSettingsTcpSettingsHeaderResponse;
}

export interface V2RayProxyNodeStreamSettingsTcpSettings {
  header?: V2RayProxyNodeStreamSettingsTcpSettingsHeader;
}

export interface V2RayProxyNodeStreamSettingsWsSettings {
  path?: string;
  headers?: Array<V2RayProxyNodeStreamSettingsTcpSettingsHeaderRequestHeadersItem>;
  maxEarlyData?: number;
  earlyDataHeaderName?: string;
}

export interface V2RayProxyNodeStreamSettingsTlsSettings {
  serverName?: string;
  allowInsecure?: boolean;
  alpn?: Array<string>;
  fingerprint?: string;
}

export interface V2RayProxyNodeStreamSettingsGrpcSettings {
  serviceName?: string;
  multiMode?: boolean;
}

export interface V2RayProxyNodeStreamSettingsHttpSettings {
  host?: Array<string>;
  path?: string;
}

export interface V2RayProxyNodeStreamSettings {
  network?: string;
  security?: string;
  tcpSettings?: V2RayProxyNodeStreamSettingsTcpSettings;
  tcpsettings?: V2RayProxyNodeStreamSettingsTcpSettings;
  wsSettings?: V2RayProxyNodeStreamSettingsWsSettings;
  wssettings?: V2RayProxyNodeStreamSettingsWsSettings;
  tlsSettings?: V2RayProxyNodeStreamSettingsTlsSettings;
  grpcSettings?: V2RayProxyNodeStreamSettingsGrpcSettings;
  httpSettings?: V2RayProxyNodeStreamSettingsHttpSettings;
}

export interface V2RayProxyNodeMux {
  enabled?: boolean;
  concurrency?: number;
  xudpConcurrency?: number;
  xudpProxyUdp443?: string;
}

export interface V2RayProxyNode {
  protocol: 'vmess';
  settings: V2RayProxyNodeSettings;
  tag?: string;
  streamSettings?: V2RayProxyNodeStreamSettings;
  streamsettings?: V2RayProxyNodeStreamSettings;
  mux?: V2RayProxyNodeMux;
}

export interface V2RayNProxyNode {
  address: string;
  port: string | number;
  id: string;
  configType: number;
  remarks?: string;
  subid?: string;
  alterId?: string | number;
  security?: string;
  network?: string;
  headerType?: string;
  requestHost?: string;
  path?: string;
  streamSecurity?: string;
  sni?: string;
  allowInsecure?: boolean;
}

export interface V2RayConfigVariant1OutboundsItemVariant2SettingsResponse {
  type?: string;
}

export interface V2RayConfigVariant1OutboundsItemVariant2Settings {
  domainStrategy?: string;
  redirect?: string;
  userLevel?: number;
  response?: V2RayConfigVariant1OutboundsItemVariant2SettingsResponse;
  address?: string;
  port?: string | number;
  network?: string;
  inboundTag?: string;
}

export interface V2RayConfigVariant1OutboundsItemVariant2 {
  protocol: 'dns' | 'freedom' | 'blackhole' | 'loopback';
  tag?: string;
  settings?: V2RayConfigVariant1OutboundsItemVariant2Settings;
}

export interface V2RayConfigVariant1 {
  outbounds: Array<V2RayProxyNode | V2RayConfigVariant1OutboundsItemVariant2>;
}

export interface V2RayConfigVariant2SubItemItem {
  id: string;
  remarks: string;
}

export interface V2RayConfigVariant2 {
  vmess: Array<V2RayNProxyNode>;
  subItem?: Array<V2RayConfigVariant2SubItemItem>;
}

export type V2RayConfig = V2RayConfigVariant1 | V2RayConfigVariant2;

export type { V2RayNodeFields } from './fields';

export type V2RayNode = V2RayProxyNode | V2RayNProxyNode;
