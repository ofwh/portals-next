import type { NodeFieldsBase } from '../common';

export interface VMessNodeFieldsHeadersItem {
  name: string;
  value: Array<string>;
}

export interface VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItemHeadersItem {
  name?: string;
  value?: string;
  values?: Array<string>;
}

export interface VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItemNextStepItem {
  weight?: number;
  gotoLocation?: number;
}

export interface VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItemWaitTime {
  baseNanoseconds?: number;
  uniformRandomMultiplierNanoseconds?: number;
}

export interface VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItem {
  name?: string;
  host?: string;
  path?: string;
  method?: string;
  headers?: Array<VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItemHeadersItem>;
  nextStep?: Array<VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItemNextStepItem>;
  connectionReady?: boolean;
  connectionRecallExit?: boolean;
  waitTime?: VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItemWaitTime;
  h2DoNotWaitForDownloadFinish?: boolean;
}

export interface VMessNodeFieldsTcpResponseHeadersItem {
  name: string;
  value: Array<string>;
}

export interface VMessNodeFields extends NodeFieldsBase {
  type: 'vmess';
  port: number;
  server: string;
  alpn?: Array<string>;
  alterId?: number;
  authenticatedLength?: boolean;
  certificate?: string | Array<string>;
  cipher?: string;
  clientFingerprint?: string;
  underlyingProxy?: string;
  echEnabled?: boolean;
  echConfig?: string | Array<string>;
  echQueryServerName?: string;
  fingerprint?: string;
  globalPadding?: boolean;
  grpcServiceName?: string;
  grpcUserAgent?: string;
  grpcPingInterval?: number;
  grpcMaxConnections?: number;
  grpcMinStreams?: number;
  grpcMaxStreams?: number;
  headers?: Array<VMessNodeFieldsHeadersItem>;
  path?: string;
  httpMethod?: string;
  paths?: Array<string>;
  interfaceName?: string;
  ipVersion?: string;
  jlsUsername?: string;
  jlsPassword?: string;
  mekyaUrl?: string;
  mekyaH2PoolSize?: number;
  mekyaMaxWriteDelay?: number;
  mekyaMaxRequestSize?: number;
  mekyaPollingIntervalInitial?: number;
  mekyaMaxWriteSize?: number;
  mekyaMaxWriteDurationMs?: number;
  mekyaMaxSimultaneousWriteConnection?: number;
  mekyaPacketWritingBuffer?: number;
  mekyaKcpMtu?: number;
  mekyaKcpTti?: number;
  mekyaKcpUplinkCapacity?: number;
  mekyaKcpDownlinkCapacity?: number;
  mekyaKcpCongestion?: boolean;
  mekyaKcpWriteBuffer?: number;
  mekyaKcpReadBuffer?: number;
  mekyaKcpSeed?: string;
  mekyaKcpHeader?: string;
  mkcpMtu?: number;
  mkcpTti?: number;
  mkcpUplinkCapacity?: number;
  mkcpDownlinkCapacity?: number;
  mkcpCongestion?: boolean;
  mkcpWriteBuffer?: number;
  mkcpReadBuffer?: number;
  mkcpSeed?: string;
  mkcpHeader?: string;
  mptcp?: boolean;
  nameCertVerify?: string;
  network?: string;
  packetAddr?: boolean;
  packetEncoding?: string;
  privateKey?: string;
  realityPublicKey?: string;
  realityShortId?: string;
  realitySupportX25519mlkem768?: boolean;
  restlsPassword?: string;
  restlsVersionHint?: string;
  restlsRestlsScript?: string;
  routingMark?: number;
  serverName?: string;
  shadowTlsPassword?: string;
  shadowTlsVersion?: number;
  allowInsecure?: boolean;
  tcpFastOpen?: boolean;
  tls?: boolean;
  tlsMirrorPrimaryKey?: string;
  tlsMirrorExplicitNonceCiphersuites?: Array<number>;
  tlsMirrorDeferInstanceDerivedWriteTimeBaseNanoseconds?: number;
  tlsMirrorDeferInstanceDerivedWriteTimeUniformRandomMultiplierNanoseconds?: number;
  tlsMirrorTransportLayerPaddingEnabled?: boolean;
  tlsMirrorConnectionEnrolmentPrimaryIngressOutbound?: string;
  tlsMirrorConnectionEnrolmentPrimaryEgressOutbound?: string;
  tlsMirrorEmbeddedTrafficGeneratorSteps?: Array<VMessNodeFieldsTlsMirrorEmbeddedTrafficGeneratorStepsItem>;
  tlsMirrorSequenceWatermarkingEnabled?: boolean;
  udp?: boolean;
  uuid: string;
  maxEarlyData?: number;
  earlyDataHeaderName?: string;
  wsV2rayHttpUpgrade?: boolean;
  wsV2rayHttpUpgradeFastOpen?: boolean;
  xudp?: boolean;
  headerType?: string;
  grpcMode?: string;
  tlsMinVersion?: string;
  tlsMaxVersion?: string;
  tls13?: boolean;
  utlsEnabled?: boolean;
  certificatePath?: string;
  echConfigPath?: string;
  disableSni?: boolean;
  multiplexEnabled?: boolean;
  multiplexProtocol?: string;
  multiplexMaxConnections?: number;
  multiplexMinStreams?: number;
  multiplexMaxStreams?: number;
  multiplexPadding?: boolean;
  multiplexBrutalEnabled?: boolean;
  multiplexBrutalUpMbps?: number;
  multiplexBrutalDownMbps?: number;
  packetNetworks?: Array<string>;
  realityEnabled?: boolean;
  httpVersion?: string;
  tcpResponseVersion?: string;
  tcpResponseStatus?: string;
  tcpResponseReason?: string;
  tcpResponseHeaders?: Array<VMessNodeFieldsTcpResponseHeadersItem>;
  xrayMuxEnabled?: boolean;
  xrayMuxConcurrency?: number;
  xrayMuxXudpConcurrency?: number;
  xrayMuxXudpProxyUdp443?: string;
}
