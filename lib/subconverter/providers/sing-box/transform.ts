import { singBoxProxyNode, singBoxWireGuardEndpoint } from './parser';
import { rejectNode } from '../../debug';
import { expand, flatten, get, projectWireGuard, put, remove } from '../../mapping';
import type { Binding } from '../../mapping';
import { createTransform } from '../../transform';
import type { SingBoxConfig, SingBoxNode } from '../../types/sing-box';
import { pluginInput, pluginOutput } from '../ss/transform';

export const supports = [
  'ss',
  'vmess',
  'vless',
  'trojan',
  'snell',
  'http',
  'https',
  'socks5',
  'wireguard',
  'hysteria',
  'hysteria2',
  'tuic',
  'anytls',
  'naive',
] as const;
const bindings = {
  ss: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'method',
      field: 'cipher',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'plugin',
      field: 'plugin',
    },
    {
      path: 'pluginOpts.mode',
      field: 'pluginMode',
    },
    {
      path: 'pluginOpts.host',
      field: 'pluginHost',
    },
    {
      path: 'pluginOpts.path',
      field: 'pluginPath',
    },
    {
      path: 'pluginOpts.tls',
      field: 'pluginTls',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.echOpts.enable',
      field: 'pluginEchOptsEnable',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.echOpts.config',
      field: 'pluginEchOptsConfig',
    },
    {
      path: 'pluginOpts.echOpts.queryServerName',
      field: 'pluginEchOptsQueryServerName',
    },
    {
      path: 'pluginOpts.fingerprint',
      field: 'pluginFingerprint',
    },
    {
      path: 'pluginOpts.certificate',
      field: 'pluginCertificate',
    },
    {
      path: 'pluginOpts.privateKey',
      field: 'pluginPrivateKey',
    },
    {
      path: 'pluginOpts.headers',
      field: 'pluginHeaders',
      codec: 'headersSingle',
    },
    {
      path: 'pluginOpts.skipCertVerify',
      field: 'pluginSkipCertVerify',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.nameCertVerify',
      field: 'pluginNameCertVerify',
    },
    {
      path: 'pluginOpts.mux',
      field: 'pluginMux',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.v2rayHttpUpgrade',
      field: 'pluginV2rayHttpUpgrade',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.v2rayHttpUpgradeFastOpen',
      field: 'pluginV2rayHttpUpgradeFastOpen',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.password',
      field: 'pluginPassword',
    },
    {
      path: 'pluginOpts.version',
      field: 'pluginVersion',
      codec: 'number',
    },
    {
      path: 'pluginOpts.alpn',
      field: 'pluginAlpn',
    },
    {
      path: 'pluginOpts.versionHint',
      field: 'pluginVersionHint',
    },
    {
      path: 'pluginOpts.restlsScript',
      field: 'pluginRestlsScript',
    },
    {
      path: 'pluginOpts.forceTls12',
      field: 'pluginForceTls12',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.username',
      field: 'pluginUsername',
    },
    {
      path: 'pluginOpts.key',
      field: 'pluginKey',
    },
    {
      path: 'pluginOpts.crypt',
      field: 'pluginCrypt',
    },
    {
      path: 'pluginOpts.conn',
      field: 'pluginConn',
      codec: 'number',
    },
    {
      path: 'pluginOpts.autoexpire',
      field: 'pluginAutoexpire',
      codec: 'number',
    },
    {
      path: 'pluginOpts.scavengettl',
      field: 'pluginScavengettl',
      codec: 'number',
    },
    {
      path: 'pluginOpts.mtu',
      field: 'pluginMtu',
      codec: 'number',
    },
    {
      path: 'pluginOpts.ratelimit',
      field: 'pluginRatelimit',
      codec: 'number',
    },
    {
      path: 'pluginOpts.sndwnd',
      field: 'pluginSndwnd',
      codec: 'number',
    },
    {
      path: 'pluginOpts.rcvwnd',
      field: 'pluginRcvwnd',
      codec: 'number',
    },
    {
      path: 'pluginOpts.datashard',
      field: 'pluginDatashard',
      codec: 'number',
    },
    {
      path: 'pluginOpts.parityshard',
      field: 'pluginParityshard',
      codec: 'number',
    },
    {
      path: 'pluginOpts.dscp',
      field: 'pluginDscp',
      codec: 'number',
    },
    {
      path: 'pluginOpts.nocomp',
      field: 'pluginNocomp',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.acknodelay',
      field: 'pluginAcknodelay',
      codec: 'boolean',
    },
    {
      path: 'pluginOpts.nodelay',
      field: 'pluginNodelay',
      codec: 'number',
    },
    {
      path: 'pluginOpts.interval',
      field: 'pluginInterval',
      codec: 'number',
    },
    {
      path: 'pluginOpts.resend',
      field: 'pluginResend',
      codec: 'number',
    },
    {
      path: 'pluginOpts.nc',
      field: 'pluginNc',
      codec: 'number',
    },
    {
      path: 'pluginOpts.sockbuf',
      field: 'pluginSockbuf',
      codec: 'number',
    },
    {
      path: 'pluginOpts.smuxver',
      field: 'pluginSmuxver',
      codec: 'number',
    },
    {
      path: 'pluginOpts.smuxbuf',
      field: 'pluginSmuxbuf',
      codec: 'number',
    },
    {
      path: 'pluginOpts.framesize',
      field: 'pluginFramesize',
      codec: 'number',
    },
    {
      path: 'pluginOpts.streambuf',
      field: 'pluginStreambuf',
      codec: 'number',
    },
    {
      path: 'pluginOpts.keepalive',
      field: 'pluginKeepalive',
      codec: 'number',
    },
    {
      path: 'multiplex.enabled',
      field: 'multiplexEnabled',
    },
    {
      path: 'multiplex.protocol',
      field: 'multiplexProtocol',
    },
    {
      path: 'multiplex.maxConnections',
      field: 'multiplexMaxConnections',
    },
    {
      path: 'multiplex.minStreams',
      field: 'multiplexMinStreams',
    },
    {
      path: 'multiplex.maxStreams',
      field: 'multiplexMaxStreams',
    },
    {
      path: 'multiplex.padding',
      field: 'multiplexPadding',
    },
    {
      path: 'multiplex.brutal.enabled',
      field: 'multiplexBrutalEnabled',
    },
    {
      path: 'multiplex.brutal.upMbps',
      field: 'multiplexBrutalUpMbps',
    },
    {
      path: 'multiplex.brutal.downMbps',
      field: 'multiplexBrutalDownMbps',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  vmess: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'uuid',
      field: 'uuid',
    },
    {
      path: 'alterId',
      field: 'alterId',
    },
    {
      path: 'security',
      field: 'cipher',
    },
    {
      path: 'transport.type',
      field: 'network',
    },
    {
      path: 'transport.headers',
      field: 'headers',
      codec: 'headersList',
    },
    {
      path: 'transport.host',
      field: 'headers',
      codec: 'hostHeaders',
    },
    {
      path: 'transport.path',
      field: 'path',
      network: 'ws',
    },
    {
      path: 'transport.path',
      field: 'path',
      network: 'httpupgrade',
    },
    {
      path: 'transport.path',
      field: 'paths',
      codec: 'list',
      network: 'http',
    },
    {
      path: 'transport.serviceName',
      field: 'grpcServiceName',
      network: 'grpc',
    },
    {
      path: 'transport.maxEarlyData',
      field: 'maxEarlyData',
      network: 'ws',
    },
    {
      path: 'transport.earlyDataHeaderName',
      field: 'earlyDataHeaderName',
      network: 'ws',
    },
    {
      path: 'multiplex.enabled',
      field: 'multiplexEnabled',
    },
    {
      path: 'multiplex.protocol',
      field: 'multiplexProtocol',
    },
    {
      path: 'multiplex.maxConnections',
      field: 'multiplexMaxConnections',
    },
    {
      path: 'multiplex.minStreams',
      field: 'multiplexMinStreams',
    },
    {
      path: 'multiplex.maxStreams',
      field: 'multiplexMaxStreams',
    },
    {
      path: 'multiplex.padding',
      field: 'multiplexPadding',
    },
    {
      path: 'multiplex.brutal.enabled',
      field: 'multiplexBrutalEnabled',
    },
    {
      path: 'multiplex.brutal.upMbps',
      field: 'multiplexBrutalUpMbps',
    },
    {
      path: 'multiplex.brutal.downMbps',
      field: 'multiplexBrutalDownMbps',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.reality.enabled',
      field: 'realityEnabled',
    },
    {
      path: 'tls.reality.publicKey',
      field: 'realityPublicKey',
    },
    {
      path: 'tls.reality.shortId',
      field: 'realityShortId',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  vless: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'uuid',
      field: 'uuid',
    },
    {
      path: 'flow',
      field: 'flow',
    },
    {
      path: 'packetEncoding',
      field: 'packetEncoding',
    },
    {
      path: 'transport.type',
      field: 'network',
    },
    {
      path: 'transport.headers',
      field: 'headers',
      codec: 'headersList',
    },
    {
      path: 'transport.host',
      field: 'headers',
      codec: 'hostHeaders',
    },
    {
      path: 'transport.path',
      field: 'path',
      network: 'ws',
    },
    {
      path: 'transport.path',
      field: 'path',
      network: 'httpupgrade',
    },
    {
      path: 'transport.path',
      field: 'paths',
      codec: 'list',
      network: 'http',
    },
    {
      path: 'transport.serviceName',
      field: 'grpcServiceName',
      network: 'grpc',
    },
    {
      path: 'transport.maxEarlyData',
      field: 'maxEarlyData',
      network: 'ws',
    },
    {
      path: 'transport.earlyDataHeaderName',
      field: 'earlyDataHeaderName',
      network: 'ws',
    },
    {
      path: 'multiplex.enabled',
      field: 'multiplexEnabled',
    },
    {
      path: 'multiplex.protocol',
      field: 'multiplexProtocol',
    },
    {
      path: 'multiplex.maxConnections',
      field: 'multiplexMaxConnections',
    },
    {
      path: 'multiplex.minStreams',
      field: 'multiplexMinStreams',
    },
    {
      path: 'multiplex.maxStreams',
      field: 'multiplexMaxStreams',
    },
    {
      path: 'multiplex.padding',
      field: 'multiplexPadding',
    },
    {
      path: 'multiplex.brutal.enabled',
      field: 'multiplexBrutalEnabled',
    },
    {
      path: 'multiplex.brutal.upMbps',
      field: 'multiplexBrutalUpMbps',
    },
    {
      path: 'multiplex.brutal.downMbps',
      field: 'multiplexBrutalDownMbps',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.reality.enabled',
      field: 'realityEnabled',
    },
    {
      path: 'tls.reality.publicKey',
      field: 'realityPublicKey',
    },
    {
      path: 'tls.reality.shortId',
      field: 'realityShortId',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  trojan: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'transport.type',
      field: 'network',
    },
    {
      path: 'transport.headers',
      field: 'headers',
      codec: 'headersList',
    },
    {
      path: 'transport.host',
      field: 'headers',
      codec: 'hostHeaders',
    },
    {
      path: 'transport.path',
      field: 'path',
      network: 'ws',
    },
    {
      path: 'transport.path',
      field: 'path',
      network: 'httpupgrade',
    },
    {
      path: 'transport.serviceName',
      field: 'grpcServiceName',
      network: 'grpc',
    },
    {
      path: 'transport.maxEarlyData',
      field: 'maxEarlyData',
      network: 'ws',
    },
    {
      path: 'transport.earlyDataHeaderName',
      field: 'earlyDataHeaderName',
      network: 'ws',
    },
    {
      path: 'multiplex.enabled',
      field: 'multiplexEnabled',
    },
    {
      path: 'multiplex.protocol',
      field: 'multiplexProtocol',
    },
    {
      path: 'multiplex.maxConnections',
      field: 'multiplexMaxConnections',
    },
    {
      path: 'multiplex.minStreams',
      field: 'multiplexMinStreams',
    },
    {
      path: 'multiplex.maxStreams',
      field: 'multiplexMaxStreams',
    },
    {
      path: 'multiplex.padding',
      field: 'multiplexPadding',
    },
    {
      path: 'multiplex.brutal.enabled',
      field: 'multiplexBrutalEnabled',
    },
    {
      path: 'multiplex.brutal.upMbps',
      field: 'multiplexBrutalUpMbps',
    },
    {
      path: 'multiplex.brutal.downMbps',
      field: 'multiplexBrutalDownMbps',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.reality.enabled',
      field: 'realityEnabled',
    },
    {
      path: 'tls.reality.publicKey',
      field: 'realityPublicKey',
    },
    {
      path: 'tls.reality.shortId',
      field: 'realityShortId',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  snell: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'version',
      field: 'snellVersion',
      codec: 'number',
    },
    {
      path: 'psk',
      field: 'password',
    },
    {
      path: 'userkey',
      field: 'snellUserKey',
    },
    {
      path: 'reuse',
      field: 'snellReuse',
    },
    {
      path: 'network',
      field: 'snellNetwork',
      codec: 'strings',
    },
    {
      path: 'mode',
      field: 'snellMode',
    },
    {
      path: 'obfsMode',
      field: 'obfs',
    },
    {
      path: 'obfsHost',
      field: 'obfsHost',
    },
  ],
  http: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  https: [
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
  ],
  socks5: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'version',
      field: 'version',
      codec: 'text',
    },
    {
      path: 'udpOverTcp.enabled',
      field: 'udpOverTcpEnabled',
    },
    {
      path: 'udpOverTcp.version',
      field: 'udpOverTcpVersion',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  hysteria: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'auth',
      field: 'auth',
    },
    {
      path: 'authStr',
      field: 'authString',
    },
    {
      path: 'upMbps',
      field: 'upMbps',
    },
    {
      path: 'downMbps',
      field: 'downMbps',
    },
    {
      path: 'obfs',
      field: 'obfs',
    },
    {
      path: 'serverPorts',
      field: 'ports',
    },
    {
      path: 'hopInterval',
      field: 'hopInterval',
      codec: 'duration',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  hysteria2: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'upMbps',
      field: 'upMbps',
    },
    {
      path: 'downMbps',
      field: 'downMbps',
    },
    {
      path: 'obfs.type',
      field: 'obfs',
    },
    {
      path: 'obfs.password',
      field: 'obfsPassword',
    },
    {
      path: 'serverPorts',
      field: 'ports',
    },
    {
      path: 'hopInterval',
      field: 'hopInterval',
      codec: 'duration',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  tuic: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'uuid',
      field: 'uuid',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'congestionControl',
      field: 'congestionControl',
    },
    {
      path: 'udpRelayMode',
      field: 'udpRelayMode',
    },
    {
      path: 'zeroRttHandshake',
      field: 'zeroRttHandshake',
    },
    {
      path: 'heartbeat',
      field: 'heartbeat',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  anytls: [
    {
      path: 'tag',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'bindInterface',
      field: 'interfaceName',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'idleSessionCheckInterval',
      field: 'idleSessionCheckInterval',
      codec: 'duration',
    },
    {
      path: 'idleSessionTimeout',
      field: 'idleSessionTimeout',
      codec: 'duration',
    },
    {
      path: 'minIdleSession',
      field: 'minIdleSession',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
  naive: [
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'serverPort',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'detour',
      field: 'underlyingProxy',
    },
    {
      path: 'tcpFastOpen',
      field: 'tcpFastOpen',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'insecureConcurrency',
      field: 'naiveInsecureConcurrency',
    },
    {
      path: 'quic',
      field: 'naiveQuic',
    },
    {
      path: 'tls.enabled',
      field: 'tls',
    },
    {
      path: 'tls.disableSni',
      field: 'disableSni',
    },
    {
      path: 'tls.serverName',
      field: 'serverName',
    },
    {
      path: 'tls.insecure',
      field: 'allowInsecure',
    },
    {
      path: 'tls.alpn',
      field: 'alpn',
    },
    {
      path: 'tls.minVersion',
      field: 'tlsMinVersion',
    },
    {
      path: 'tls.maxVersion',
      field: 'tlsMaxVersion',
    },
    {
      path: 'tls.certificate',
      field: 'certificate',
    },
    {
      path: 'tls.certificatePath',
      field: 'certificatePath',
    },
    {
      path: 'tls.utls.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'tls.utls.enabled',
      field: 'utlsEnabled',
    },
    {
      path: 'tls.ech.enabled',
      field: 'echEnabled',
    },
    {
      path: 'tls.ech.config',
      field: 'echConfig',
    },
    {
      path: 'tls.ech.configPath',
      field: 'echConfigPath',
    },
    {
      path: 'network',
      field: 'packetNetworks',
      codec: 'strings',
    },
  ],
} as const satisfies { [K in Exclude<(typeof supports)[number], 'wireguard'>]: readonly Binding[] };
const endpointBindings = [
  {
    path: 'tag',
    field: 'name',
  },
  {
    path: 'privateKey',
    field: 'privateKey',
  },
  {
    path: 'address',
    field: 'localAddresses',
  },
  {
    path: 'peers',
    field: 'wireGuardPeers',
    codec: 'endpointPeers',
  },
  {
    path: 'system',
    field: 'wireGuardSystem',
  },
  {
    path: 'name',
    field: 'wireGuardInterfaceName',
  },
  {
    path: 'mtu',
    field: 'mtu',
  },
  {
    path: 'listenPort',
    field: 'wireGuardListenPort',
  },
  {
    path: 'workers',
    field: 'wireGuardWorkers',
  },
] as const satisfies readonly Binding[];
const legacyBindings = [
  {
    path: 'tag',
    field: 'name',
  },
  {
    path: 'privateKey',
    field: 'privateKey',
  },
  {
    path: 'localAddress',
    field: 'localAddresses',
  },
  {
    path: 'peers',
    field: 'wireGuardPeers',
    codec: 'singBoxPeers',
  },
  {
    path: 'mtu',
    field: 'mtu',
  },
] as const satisfies readonly Binding[];

export function readNode(value: unknown): SingBoxNode {
  if (get(value, 'type') === 'wireguard' && get(value, 'address') !== undefined) {
    return singBoxWireGuardEndpoint(value);
  }

  const node = singBoxProxyNode(value);

  if (node.type === 'snell') {
    const version = Number(node.version);
    const psk = node.psk ?? '';

    if (![4, 6].includes(version) || !psk || (node.userkey?.length ?? 0) > 255) {
      return rejectNode('invalid-snell-configuration');
    }

    const networks = node.network === undefined ? [] : typeof node.network === 'string' ? [node.network] : node.network;

    if (networks.some((network) => !['tcp', 'udp'].includes(network)) || new Set(networks).size !== networks.length) {
      return rejectNode('invalid-snell-network');
    }

    if (
      version === 4 &&
      ((node.mode ?? '') !== '' ||
        !['', 'none', 'http'].includes(node.obfsMode ?? '') ||
        ((node.obfsHost ?? '') !== '' && node.obfsMode !== 'http'))
    ) {
      return rejectNode('invalid-snell-obfuscation');
    }

    if (
      version === 6 &&
      (psk.length < 12 ||
        psk.length > 255 ||
        (node.obfsMode ?? '') !== '' ||
        (node.obfsHost ?? '') !== '' ||
        !['', 'default', 'unshaped', 'unsafe-raw'].includes(node.mode ?? ''))
    ) {
      return rejectNode('invalid-snell-configuration');
    }
  }

  switch (node.type) {
    case 'shadowsocks':
      return { ...node, type: 'shadowsocks' };
    case 'vmess':
      return { ...node, type: 'vmess' };
    case 'vless':
      return { ...node, type: 'vless' };
    case 'trojan':
      return { ...node, type: 'trojan' };
    case 'snell':
      return { ...node, type: 'snell' };
    case 'http':
      return { ...node, type: 'http' };
    case 'socks':
      return { ...node, type: 'socks' };
    case 'wireguard':
      return { ...node, type: 'wireguard' };
    case 'hysteria':
      return { ...node, type: 'hysteria' };
    case 'hysteria2':
      return { ...node, type: 'hysteria2' };
    case 'tuic':
      return { ...node, type: 'tuic' };
    case 'anytls':
      return { ...node, type: 'anytls' };
    case 'naive':
      return { ...node, type: 'naive' };
  }
}

export function extract(config: SingBoxConfig): SingBoxNode[] {
  const nodes: SingBoxNode[] = [];

  for (const node of config.outbounds ?? []) {
    if (!['direct', 'block', 'dns', 'selector', 'urltest'].includes(node.type)) {
      nodes.push(readNode(node));
    }
  }
  nodes.push(...(config.endpoints ?? []));

  return nodes;
}

export const transform = createTransform({
  provider: 'sing-box',
  supports,
  readNode,
  toFields(node) {
    if (node.type === 'wireguard') {
      const endpoint = 'address' in node;

      return flatten(
        'wireguard',
        endpoint ? node : projectWireGuard(node, 'sing-box'),
        endpoint ? endpointBindings : legacyBindings,
      );
    }

    const type =
      node.type === 'shadowsocks'
        ? 'ss'
        : node.type === 'socks'
          ? 'socks5'
          : node.type === 'http' && node.tls?.enabled
            ? 'https'
            : node.type;
    const source = type === 'ss' ? pluginInput(node) : { ...node };

    if (typeof get(source, 'udpOverTcp') === 'boolean') {
      put(source, 'udpOverTcp', { enabled: get(source, 'udpOverTcp') });
    }

    if (get(source, 'tls.utls') !== undefined && get(source, 'tls.utls.enabled') === undefined) {
      put(source, 'tls.utls.enabled', false);
    }

    if (get(source, 'tls.reality') !== undefined && get(source, 'tls.reality.enabled') === undefined) {
      put(source, 'tls.reality.enabled', false);
    }

    if (type === 'snell') {
      if (![4, 6].includes(Number(node.version))) {
        return rejectNode('unsupported-snell-version');
      }

      return flatten('snell', source, bindings.snell);
    }

    if (type === 'socks5' && node.version !== undefined && String(node.version) !== '5') {
      return rejectNode('unsupported-socks-version');
    }

    const network = get(source, 'transport.type');
    // Mapping conditions refer to the transport rather than packet restrictions.
    const packetNetwork = get(source, 'network');

    remove(source, 'network');
    if (network !== undefined) {
      put(source, 'network', network);
    }

    const mapped: Binding[] = bindings[type].filter((binding) => binding.path !== 'network');

    if (
      packetNetwork !== undefined &&
      !['ss', 'vmess', 'vless', 'trojan', 'socks5', 'hysteria', 'hysteria2', 'tuic'].includes(type)
    ) {
      return rejectNode('unsupported-packet-network');
    }

    if (packetNetwork !== undefined) {
      put(source, 'packetNetwork', packetNetwork);
      mapped.push({ path: 'packetNetwork', field: 'packetNetworks', codec: 'strings' });
    }

    if (packetNetwork !== undefined) {
      const values = Array.isArray(packetNetwork) ? packetNetwork : [packetNetwork];

      if (values.some((item) => !['tcp', 'udp'].includes(String(item)))) {
        return rejectNode('invalid-packet-network');
      }

      if (values.includes('tcp')) {
        remove(source, 'packetNetwork');
        const at = mapped.findIndex((binding) => binding.path === 'packetNetwork');

        if (at >= 0) {
          mapped.splice(at, 1);
        }

        put(source, 'udp', values.includes('udp'));
        mapped.push({ path: 'udp', field: 'udp' });
      }
    }

    const result = flatten(type, source, mapped, ['type', ...(network !== undefined ? ['network'] : [])]);

    return result;
  },
  toNode(fields): SingBoxNode {
    if (fields.type === 'wireguard') {
      return singBoxWireGuardEndpoint(expand(fields, endpointBindings, { type: 'wireguard' }));
    }

    const nativeType =
      fields.type === 'ss'
        ? 'shadowsocks'
        : fields.type === 'socks5'
          ? 'socks'
          : fields.type === 'https'
            ? 'http'
            : fields.type;
    const initial = { type: nativeType };

    if (fields.type === 'vmess' && fields.cipher === undefined) {
      put(initial, 'security', 'auto');
    }

    if (['trojan', 'anytls', 'hysteria', 'hysteria2', 'tuic', 'naive', 'https'].includes(fields.type)) {
      put(initial, 'tls.enabled', true);
    }

    const fingerprint = get(fields, 'clientFingerprint');
    const utls = get(fields, 'utlsEnabled');
    const fixed = fields.type === 'vless' ? { encryption: 'none' } : {};

    if (get(fields, 'headerType') === 'none') {
      put(fixed, 'headerType', 'none');
    }

    if (fingerprint !== undefined || utls === true) {
      put(initial, 'tls.utls.enabled', utls !== false);
      put(initial, 'tls.utls.fingerprint', fingerprint ?? 'chrome');
    }

    if (
      get(fields, 'packetNetworks') !== undefined &&
      !['ss', 'vmess', 'vless', 'trojan', 'socks5', 'hysteria', 'hysteria2', 'tuic'].includes(fields.type)
    ) {
      return rejectNode('unrepresentable-packet-network');
    }

    const udp = get(fields, 'udp');

    if (typeof udp === 'boolean') {
      if (
        !['ss', 'vmess', 'vless', 'trojan', 'socks5', 'hysteria', 'hysteria2', 'tuic', 'snell'].includes(fields.type)
      ) {
        return rejectNode('unrepresentable-udp-control');
      }

      const networks = get(fields, 'packetNetworks');

      if (networks !== undefined && Array.isArray(networks) && networks.includes('udp') !== udp) {
        return rejectNode('conflicting-packet-networks');
      }

      put(fixed, 'udp', udp);
      if (networks === undefined) {
        put(initial, 'network', udp ? ['tcp', 'udp'] : ['tcp']);
      }
    }

    const output = expand(fields, bindings[fields.type], initial, fixed);

    if (fields.type === 'ss') {
      return readNode(pluginOutput(output));
    }

    return readNode(output);
  },
});
