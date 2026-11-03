import { clashProxyNode } from './parser';
import { rejectNode } from '../../proxy-node/debug';
import { expand, flatten, get, nativeFingerprint, projectWireGuard, put, remove } from '../../proxy-node/mapping';
import { createTransform, supportsType } from '../../proxy-node/transform';
import type { ClashConfig, ClashNode } from '../../types/providers/clash';
import type { ProxyNodeFields } from '../../types/proxy-node/fields';
import type { Binding } from '../../types/proxy-node/mapping';

export const supports = [
  'anytls',
  'easytier',
  'gost-relay',
  'http',
  'hysteria',
  'hysteria2',
  'masque',
  'mieru',
  'openvpn',
  'shadowquic',
  'snell',
  'socks5',
  'ss',
  'ssh',
  'ssr',
  'sudoku',
  'tailscale',
  'trojan',
  'trusttunnel',
  'tuic',
  'vless',
  'vmess',
  'wireguard',
  'zerotier',
  'https',
] as const;

const bindings = {
  anytls: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'clientMetadata',
      field: 'clientMetadata',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'disableReuse',
      field: 'disableReuse',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'idleSessionCheckInterval',
      field: 'idleSessionCheckInterval',
    },
    {
      path: 'idleSessionTimeout',
      field: 'idleSessionTimeout',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'jlsOpts.username',
      field: 'jlsUsername',
    },
    {
      path: 'jlsOpts.password',
      field: 'jlsPassword',
    },
    {
      path: 'minIdleSession',
      field: 'minIdleSession',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'restlsOpts.password',
      field: 'restlsPassword',
    },
    {
      path: 'restlsOpts.versionHint',
      field: 'restlsVersionHint',
    },
    {
      path: 'restlsOpts.restlsScript',
      field: 'restlsRestlsScript',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'shadowTlsOpts.password',
      field: 'shadowTlsPassword',
    },
    {
      path: 'shadowTlsOpts.version',
      field: 'shadowTlsVersion',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
  ],
  easytier: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'acceptDns',
      field: 'acceptDns',
    },
    {
      path: 'dhcp',
      field: 'dhcp',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'disableKcpInput',
      field: 'disableKcpInput',
    },
    {
      path: 'disableP2p',
      field: 'disableP2p',
    },
    {
      path: 'disableQuicInput',
      field: 'disableQuicInput',
    },
    {
      path: 'enableEncryption',
      field: 'enableEncryption',
    },
    {
      path: 'enableExitNode',
      field: 'enableExitNode',
    },
    {
      path: 'enableKcpProxy',
      field: 'enableKcpProxy',
    },
    {
      path: 'enableQuicProxy',
      field: 'enableQuicProxy',
    },
    {
      path: 'encryptionAlgorithm',
      field: 'encryptionAlgorithm',
    },
    {
      path: 'exitNodes',
      field: 'exitNodes',
    },
    {
      path: 'hostname',
      field: 'hostname',
    },
    {
      path: 'instanceName',
      field: 'instanceName',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'ipv4',
      field: 'ipv4',
    },
    {
      path: 'latencyFirst',
      field: 'latencyFirst',
    },
    {
      path: 'listeners',
      field: 'listeners',
    },
    {
      path: 'localPrivateKey',
      field: 'localPrivateKey',
    },
    {
      path: 'localPublicKey',
      field: 'localPublicKey',
    },
    {
      path: 'mappedListeners',
      field: 'mappedListeners',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'mtu',
      field: 'mtu',
    },
    {
      path: 'networkName',
      field: 'networkName',
    },
    {
      path: 'networkSecret',
      field: 'networkSecret',
    },
    {
      path: 'noListener',
      field: 'noListener',
    },
    {
      path: 'peers',
      field: 'peers',
    },
    {
      path: 'privateMode',
      field: 'privateMode',
    },
    {
      path: 'proxyNetworks',
      field: 'proxyNetworks',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'secureMode',
      field: 'secureMode',
    },
    {
      path: 'stateDir',
      field: 'stateDir',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'tldDnsZone',
      field: 'tldDnsZone',
    },
    {
      path: 'udp',
      field: 'udp',
    },
  ],
  'gost-relay': [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'forward',
      field: 'forward',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'mux',
      field: 'mux',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'tls',
      field: 'tls',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'username',
      field: 'username',
    },
  ],
  http: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'headers',
      field: 'headers',
      codec: 'headersSingle',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'tls',
      field: 'tls',
    },
    {
      path: 'username',
      field: 'username',
    },
  ],
  hysteria: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
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
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'disableMtuDiscovery',
      field: 'disableMtuDiscovery',
    },
    {
      path: 'down',
      field: 'downMbps',
      codec: 'bandwidth',
    },
    {
      path: 'downSpeed',
      field: 'downSpeed',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'fastOpen',
      field: 'fastOpen',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'hopInterval',
      field: 'hopInterval',
      codec: 'seconds',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'obfs',
      field: 'obfs',
    },
    {
      path: 'obfsProtocol',
      field: 'obfsProtocol',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'ports',
      field: 'ports',
      codec: 'ports',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'protocol',
      field: 'protocol',
    },
    {
      path: 'recvWindow',
      field: 'recvWindow',
    },
    {
      path: 'recvWindowConn',
      field: 'recvWindowConn',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'up',
      field: 'upMbps',
      codec: 'bandwidth',
    },
    {
      path: 'upSpeed',
      field: 'upSpeed',
    },
  ],
  hysteria2: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'bbrProfile',
      field: 'bbrProfile',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'cwnd',
      field: 'cwnd',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'down',
      field: 'downMbps',
      codec: 'bandwidth',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'handshakeTimeout',
      field: 'handshakeTimeout',
    },
    {
      path: 'hopInterval',
      field: 'hopInterval',
      codec: 'duration',
    },
    {
      path: 'initialConnectionReceiveWindow',
      field: 'initialConnectionReceiveWindow',
    },
    {
      path: 'initialStreamReceiveWindow',
      field: 'initialStreamReceiveWindow',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'maxConnectionReceiveWindow',
      field: 'maxConnectionReceiveWindow',
    },
    {
      path: 'maxStreamReceiveWindow',
      field: 'maxStreamReceiveWindow',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'obfs',
      field: 'obfs',
    },
    {
      path: 'obfsMaxPacketSize',
      field: 'obfsMaxPacketSize',
    },
    {
      path: 'obfsMinPacketSize',
      field: 'obfsMinPacketSize',
    },
    {
      path: 'obfsPassword',
      field: 'obfsPassword',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'ports',
      field: 'ports',
      codec: 'ports',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'realmOpts.enable',
      field: 'realmEnable',
    },
    {
      path: 'realmOpts.serverUrl',
      field: 'realmServerUrl',
    },
    {
      path: 'realmOpts.token',
      field: 'realmToken',
    },
    {
      path: 'realmOpts.realmId',
      field: 'realmRealmId',
    },
    {
      path: 'realmOpts.stunServers',
      field: 'realmStunServers',
    },
    {
      path: 'realmOpts.sni',
      field: 'realmSni',
    },
    {
      path: 'realmOpts.skipCertVerify',
      field: 'realmSkipCertVerify',
    },
    {
      path: 'realmOpts.nameCertVerify',
      field: 'realmNameCertVerify',
    },
    {
      path: 'realmOpts.fingerprint',
      field: 'realmFingerprint',
    },
    {
      path: 'realmOpts.certificate',
      field: 'realmCertificate',
    },
    {
      path: 'realmOpts.privateKey',
      field: 'realmPrivateKey',
    },
    {
      path: 'realmOpts.alpn',
      field: 'realmAlpn',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udpMtu',
      field: 'udpMtu',
    },
    {
      path: 'up',
      field: 'upMbps',
      codec: 'bandwidth',
    },
  ],
  masque: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'bbrProfile',
      field: 'bbrProfile',
    },
    {
      path: 'congestionController',
      field: 'congestionControl',
    },
    {
      path: 'cwnd',
      field: 'cwnd',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'dns',
      field: 'dnsServers',
    },
    {
      path: 'handshakeTimeout',
      field: 'handshakeTimeout',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ip',
      field: 'localAddresses',
      codec: 'ipv4',
    },
    {
      path: 'ipStack.mode',
      field: 'ipStackMode',
    },
    {
      path: 'ipStack.congestionController',
      field: 'ipStackCongestionController',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'ipv6',
      field: 'localAddresses',
      codec: 'ipv6',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'mtu',
      field: 'mtu',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'network',
      field: 'network',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'publicKey',
      field: 'publicKey',
    },
    {
      path: 'remoteDnsResolve',
      field: 'remoteDnsResolve',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'uri',
      field: 'uri',
    },
  ],
  mieru: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'handshakeMode',
      field: 'mieruHandshakeMode',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'multiplexing',
      field: 'multiplexing',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'portRange',
      field: 'ports',
      codec: 'ports',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'trafficPattern',
      field: 'mieruTrafficPattern',
    },
    {
      path: 'transport',
      field: 'network',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'username',
      field: 'username',
    },
  ],
  openvpn: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'auth',
      field: 'auth',
    },
    {
      path: 'ca',
      field: 'ca',
    },
    {
      path: 'cert',
      field: 'cert',
    },
    {
      path: 'cipher',
      field: 'cipher',
    },
    {
      path: 'compLzo',
      field: 'compLzo',
    },
    {
      path: 'dataCiphers',
      field: 'dataCiphers',
    },
    {
      path: 'dataCiphersFallback',
      field: 'dataCiphersFallback',
    },
    {
      path: 'dev',
      field: 'dev',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'dns',
      field: 'dnsServers',
    },
    {
      path: 'handshakeTimeout',
      field: 'handshakeTimeout',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipStack.mode',
      field: 'ipStackMode',
    },
    {
      path: 'ipStack.congestionController',
      field: 'ipStackCongestionController',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'key',
      field: 'key',
    },
    {
      path: 'keyDirection',
      field: 'keyDirection',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'mtu',
      field: 'mtu',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'peerInfo',
      field: 'peerInfo',
    },
    {
      path: 'ping',
      field: 'ping',
    },
    {
      path: 'pingRestart',
      field: 'pingRestart',
    },
    {
      path: 'proto',
      field: 'proto',
    },
    {
      path: 'remoteDnsResolve',
      field: 'remoteDnsResolve',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'tlsAuth',
      field: 'tlsAuth',
    },
    {
      path: 'tlsCrypt',
      field: 'tlsCrypt',
    },
    {
      path: 'tlsCryptV2',
      field: 'tlsCryptV2',
    },
    {
      path: 'tranWindow',
      field: 'tranWindow',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'username',
      field: 'username',
    },
  ],
  shadowquic: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'bbrProfile',
      field: 'bbrProfile',
    },
    {
      path: 'congestionController',
      field: 'congestionControl',
    },
    {
      path: 'cwnd',
      field: 'cwnd',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'disableMtuDiscovery',
      field: 'disableMtuDiscovery',
    },
    {
      path: 'down',
      field: 'downMbps',
      codec: 'bandwidth',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'keepAliveInterval',
      field: 'keepAliveInterval',
    },
    {
      path: 'maxDatagramFrameSize',
      field: 'maxDatagramFrameSize',
    },
    {
      path: 'maxOpenStreams',
      field: 'maxOpenStreams',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'quicVersions',
      field: 'quicVersions',
    },
    {
      path: 'recvWindow',
      field: 'recvWindow',
    },
    {
      path: 'recvWindowConn',
      field: 'recvWindowConn',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udpOverStream',
      field: 'udpOverStream',
    },
    {
      path: 'up',
      field: 'upMbps',
      codec: 'bandwidth',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'zeroRtt',
      field: 'zeroRtt',
    },
  ],
  snell: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'obfsOpts.mode',
      field: 'obfs',
    },
    {
      path: 'obfsOpts.host',
      field: 'obfsHost',
    },
    {
      path: 'obfsOpts.password',
      field: 'shadowTlsPassword',
    },
    {
      path: 'obfsOpts.version',
      field: 'shadowTlsVersion',
    },
    {
      path: 'obfsOpts.alpn',
      field: 'shadowTlsAlpn',
    },
    {
      path: 'psk',
      field: 'password',
    },
    {
      path: 'reuse',
      field: 'snellReuse',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'version',
      field: 'snellVersion',
    },
  ],
  socks5: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'tls',
      field: 'tls',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'username',
      field: 'username',
    },
  ],
  ss: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'cipher',
      field: 'cipher',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
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
    },
    {
      path: 'pluginOpts.echOpts.enable',
      field: 'pluginEchOptsEnable',
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
    },
    {
      path: 'pluginOpts.nameCertVerify',
      field: 'pluginNameCertVerify',
    },
    {
      path: 'pluginOpts.mux',
      field: 'pluginMux',
    },
    {
      path: 'pluginOpts.v2rayHttpUpgrade',
      field: 'pluginV2rayHttpUpgrade',
    },
    {
      path: 'pluginOpts.v2rayHttpUpgradeFastOpen',
      field: 'pluginV2rayHttpUpgradeFastOpen',
    },
    {
      path: 'pluginOpts.password',
      field: 'pluginPassword',
    },
    {
      path: 'pluginOpts.version',
      field: 'pluginVersion',
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
    },
    {
      path: 'pluginOpts.autoexpire',
      field: 'pluginAutoexpire',
    },
    {
      path: 'pluginOpts.scavengettl',
      field: 'pluginScavengettl',
    },
    {
      path: 'pluginOpts.mtu',
      field: 'pluginMtu',
    },
    {
      path: 'pluginOpts.ratelimit',
      field: 'pluginRatelimit',
    },
    {
      path: 'pluginOpts.sndwnd',
      field: 'pluginSndwnd',
    },
    {
      path: 'pluginOpts.rcvwnd',
      field: 'pluginRcvwnd',
    },
    {
      path: 'pluginOpts.datashard',
      field: 'pluginDatashard',
    },
    {
      path: 'pluginOpts.parityshard',
      field: 'pluginParityshard',
    },
    {
      path: 'pluginOpts.dscp',
      field: 'pluginDscp',
    },
    {
      path: 'pluginOpts.nocomp',
      field: 'pluginNocomp',
    },
    {
      path: 'pluginOpts.acknodelay',
      field: 'pluginAcknodelay',
    },
    {
      path: 'pluginOpts.nodelay',
      field: 'pluginNodelay',
    },
    {
      path: 'pluginOpts.interval',
      field: 'pluginInterval',
    },
    {
      path: 'pluginOpts.resend',
      field: 'pluginResend',
    },
    {
      path: 'pluginOpts.nc',
      field: 'pluginNc',
    },
    {
      path: 'pluginOpts.sockbuf',
      field: 'pluginSockbuf',
    },
    {
      path: 'pluginOpts.smuxver',
      field: 'pluginSmuxver',
    },
    {
      path: 'pluginOpts.smuxbuf',
      field: 'pluginSmuxbuf',
    },
    {
      path: 'pluginOpts.framesize',
      field: 'pluginFramesize',
    },
    {
      path: 'pluginOpts.streambuf',
      field: 'pluginStreambuf',
    },
    {
      path: 'pluginOpts.keepalive',
      field: 'pluginKeepalive',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'udpOverTcp',
      field: 'udpOverTcpEnabled',
    },
    {
      path: 'udpOverTcpVersion',
      field: 'udpOverTcpVersion',
    },
  ],
  ssh: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'hostKey',
      field: 'hostKey',
    },
    {
      path: 'hostKeyAlgorithms',
      field: 'hostKeyAlgorithms',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'privateKeyPassphrase',
      field: 'privateKeyPassphrase',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'username',
      field: 'username',
    },
  ],
  ssr: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'cipher',
      field: 'cipher',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'obfs',
      field: 'obfs',
    },
    {
      path: 'obfsParam',
      field: 'obfsParam',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'protocol',
      field: 'protocol',
    },
    {
      path: 'protocolParam',
      field: 'protocolParam',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
  ],
  sudoku: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'aeadMethod',
      field: 'aeadMethod',
    },
    {
      path: 'customTable',
      field: 'customTable',
    },
    {
      path: 'customTables',
      field: 'customTables',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'enablePureDownlink',
      field: 'enablePureDownlink',
    },
    {
      path: 'httpMask',
      field: 'httpMask',
    },
    {
      path: 'httpMaskHost',
      field: 'httpMaskHost',
    },
    {
      path: 'httpMaskMode',
      field: 'httpMaskMode',
    },
    {
      path: 'httpMaskMultiplex',
      field: 'httpMaskMultiplex',
    },
    {
      path: 'httpMaskTls',
      field: 'httpMaskTls',
    },
    {
      path: 'httpmask.disable',
      field: 'httpmaskDisable',
    },
    {
      path: 'httpmask.mode',
      field: 'httpmaskMode',
    },
    {
      path: 'httpmask.tls',
      field: 'httpmaskTls',
    },
    {
      path: 'httpmask.host',
      field: 'httpmaskHost',
    },
    {
      path: 'httpmask.pathRoot',
      field: 'httpmaskPathRoot',
    },
    {
      path: 'httpmask.multiplex',
      field: 'httpmaskMultiplex',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'key',
      field: 'key',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'multiplex',
      field: 'multiplex',
    },
    {
      path: 'paddingMax',
      field: 'paddingMax',
    },
    {
      path: 'paddingMin',
      field: 'paddingMin',
    },
    {
      path: 'pathRoot',
      field: 'pathRoot',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tableType',
      field: 'tableType',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
  ],
  tailscale: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'acceptRoutes',
      field: 'acceptRoutes',
    },
    {
      path: 'authKey',
      field: 'authKey',
    },
    {
      path: 'controlUrl',
      field: 'controlUrl',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'ephemeral',
      field: 'ephemeral',
    },
    {
      path: 'exitNode',
      field: 'exitNode',
    },
    {
      path: 'exitNodeAllowLanAccess',
      field: 'exitNodeAllowLanAccess',
    },
    {
      path: 'hostname',
      field: 'hostname',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'stateDir',
      field: 'stateDir',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
  ],
  trojan: [
    {
      path: 'wsOpts.path',
      field: 'path',
      network: 'ws',
    },
    {
      path: 'wsOpts.headers',
      field: 'headers',
      codec: 'headersSingle',
      network: 'ws',
    },
    {
      path: 'wsOpts.maxEarlyData',
      field: 'maxEarlyData',
      network: 'ws',
    },
    {
      path: 'wsOpts.earlyDataHeaderName',
      field: 'earlyDataHeaderName',
      network: 'ws',
    },
    {
      path: 'wsOpts.v2rayHttpUpgrade',
      field: 'wsV2rayHttpUpgrade',
      network: 'ws',
    },
    {
      path: 'wsOpts.v2rayHttpUpgradeFastOpen',
      field: 'wsV2rayHttpUpgradeFastOpen',
      network: 'ws',
    },
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'grpcOpts.grpcServiceName',
      field: 'grpcServiceName',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.grpcUserAgent',
      field: 'grpcUserAgent',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.pingInterval',
      field: 'grpcPingInterval',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.maxConnections',
      field: 'grpcMaxConnections',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.minStreams',
      field: 'grpcMinStreams',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.maxStreams',
      field: 'grpcMaxStreams',
      network: 'grpc',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'jlsOpts.username',
      field: 'jlsUsername',
    },
    {
      path: 'jlsOpts.password',
      field: 'jlsPassword',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'network',
      field: 'network',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'realityOpts.publicKey',
      field: 'realityPublicKey',
    },
    {
      path: 'realityOpts.shortId',
      field: 'realityShortId',
    },
    {
      path: 'realityOpts.supportX25519mlkem768',
      field: 'realitySupportX25519mlkem768',
    },
    {
      path: 'restlsOpts.password',
      field: 'restlsPassword',
    },
    {
      path: 'restlsOpts.versionHint',
      field: 'restlsVersionHint',
    },
    {
      path: 'restlsOpts.restlsScript',
      field: 'restlsRestlsScript',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'shadowTlsOpts.password',
      field: 'shadowTlsPassword',
    },
    {
      path: 'shadowTlsOpts.version',
      field: 'shadowTlsVersion',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'ssOpts.enabled',
      field: 'ssEnabled',
    },
    {
      path: 'ssOpts.method',
      field: 'ssMethod',
    },
    {
      path: 'ssOpts.password',
      field: 'ssPassword',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
  ],
  trusttunnel: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'bbrProfile',
      field: 'bbrProfile',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'congestionController',
      field: 'congestionControl',
    },
    {
      path: 'cwnd',
      field: 'cwnd',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'healthCheck',
      field: 'healthCheck',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'maxConnections',
      field: 'maxConnections',
    },
    {
      path: 'maxStreams',
      field: 'maxStreams',
    },
    {
      path: 'minStreams',
      field: 'minStreams',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'quic',
      field: 'quic',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'username',
      field: 'username',
    },
  ],
  tuic: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'bbrProfile',
      field: 'bbrProfile',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'congestionController',
      field: 'congestionControl',
    },
    {
      path: 'cwnd',
      field: 'cwnd',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'disableMtuDiscovery',
      field: 'disableMtuDiscovery',
    },
    {
      path: 'disableSni',
      field: 'disableSni',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'fastOpen',
      field: 'fastOpen',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'heartbeatInterval',
      field: 'heartbeatInterval',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ip',
      field: 'localAddresses',
      codec: 'ipv4',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'maxDatagramFrameSize',
      field: 'maxDatagramFrameSize',
    },
    {
      path: 'maxOpenStreams',
      field: 'maxOpenStreams',
    },
    {
      path: 'maxUdpRelayPacketSize',
      field: 'maxUdpRelayPacketSize',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'recvWindow',
      field: 'recvWindow',
    },
    {
      path: 'recvWindowConn',
      field: 'recvWindowConn',
    },
    {
      path: 'reduceRtt',
      field: 'reduceRtt',
    },
    {
      path: 'requestTimeout',
      field: 'requestTimeout',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'sni',
      field: 'serverName',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'token',
      field: 'token',
    },
    {
      path: 'udpOverStream',
      field: 'udpOverStream',
    },
    {
      path: 'udpOverStreamVersion',
      field: 'udpOverStreamVersion',
    },
    {
      path: 'udpRelayMode',
      field: 'udpRelayMode',
    },
    {
      path: 'uuid',
      field: 'uuid',
    },
  ],
  vless: [
    {
      path: 'wsOpts.path',
      field: 'path',
      network: 'ws',
    },
    {
      path: 'wsOpts.headers',
      field: 'headers',
      codec: 'headersSingle',
      network: 'ws',
    },
    {
      path: 'wsOpts.maxEarlyData',
      field: 'maxEarlyData',
      network: 'ws',
    },
    {
      path: 'wsOpts.earlyDataHeaderName',
      field: 'earlyDataHeaderName',
      network: 'ws',
    },
    {
      path: 'wsOpts.v2rayHttpUpgrade',
      field: 'wsV2rayHttpUpgrade',
      network: 'ws',
    },
    {
      path: 'wsOpts.v2rayHttpUpgradeFastOpen',
      field: 'wsV2rayHttpUpgradeFastOpen',
      network: 'ws',
    },
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'encryption',
      field: 'encryption',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'flow',
      field: 'flow',
    },
    {
      path: 'grpcOpts.grpcServiceName',
      field: 'grpcServiceName',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.grpcUserAgent',
      field: 'grpcUserAgent',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.pingInterval',
      field: 'grpcPingInterval',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.maxConnections',
      field: 'grpcMaxConnections',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.minStreams',
      field: 'grpcMinStreams',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.maxStreams',
      field: 'grpcMaxStreams',
      network: 'grpc',
    },
    {
      path: 'h2Opts.host',
      field: 'headers',
      codec: 'hostHeaders',
      network: 'h2',
    },
    {
      path: 'h2Opts.path',
      field: 'path',
      network: 'h2',
    },
    {
      path: 'httpOpts.method',
      field: 'httpMethod',
      network: 'http',
    },
    {
      path: 'httpOpts.path',
      field: 'paths',
      network: 'http',
    },
    {
      path: 'httpOpts.headers',
      field: 'headers',
      codec: 'headersList',
      network: 'http',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'jlsOpts.username',
      field: 'jlsUsername',
    },
    {
      path: 'jlsOpts.password',
      field: 'jlsPassword',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'network',
      field: 'network',
    },
    {
      path: 'packetAddr',
      field: 'packetAddr',
    },
    {
      path: 'packetEncoding',
      field: 'packetEncoding',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'realityOpts.publicKey',
      field: 'realityPublicKey',
    },
    {
      path: 'realityOpts.shortId',
      field: 'realityShortId',
    },
    {
      path: 'realityOpts.supportX25519mlkem768',
      field: 'realitySupportX25519mlkem768',
    },
    {
      path: 'restlsOpts.password',
      field: 'restlsPassword',
    },
    {
      path: 'restlsOpts.versionHint',
      field: 'restlsVersionHint',
    },
    {
      path: 'restlsOpts.restlsScript',
      field: 'restlsRestlsScript',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'servername',
      field: 'serverName',
    },
    {
      path: 'shadowTlsOpts.password',
      field: 'shadowTlsPassword',
    },
    {
      path: 'shadowTlsOpts.version',
      field: 'shadowTlsVersion',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'tls',
      field: 'tls',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'uuid',
      field: 'uuid',
    },
    {
      path: 'wsHeaders',
      field: 'headers',
      codec: 'headersSingle',
      network: 'ws',
    },
    {
      path: 'xhttpOpts.path',
      field: 'xhttpPath',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.host',
      field: 'xhttpHost',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.mode',
      field: 'xhttpMode',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.headers',
      field: 'xhttpHeaders',
      codec: 'headersSingle',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.noGrpcHeader',
      field: 'xhttpNoGrpcHeader',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.xPaddingBytes',
      field: 'xhttpXPaddingBytes',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.xPaddingObfsMode',
      field: 'xhttpXPaddingObfsMode',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.xPaddingKey',
      field: 'xhttpXPaddingKey',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.xPaddingHeader',
      field: 'xhttpXPaddingHeader',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.xPaddingPlacement',
      field: 'xhttpXPaddingPlacement',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.xPaddingMethod',
      field: 'xhttpXPaddingMethod',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.uplinkHttpMethod',
      field: 'xhttpUplinkHttpMethod',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.sessionPlacement',
      field: 'xhttpSessionPlacement',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.sessionKey',
      field: 'xhttpSessionKey',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.sessionTable',
      field: 'xhttpSessionTable',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.sessionLength',
      field: 'xhttpSessionLength',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.seqPlacement',
      field: 'xhttpSeqPlacement',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.seqKey',
      field: 'xhttpSeqKey',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.uplinkDataPlacement',
      field: 'xhttpUplinkDataPlacement',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.uplinkDataKey',
      field: 'xhttpUplinkDataKey',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.uplinkChunkSize',
      field: 'xhttpUplinkChunkSize',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.scMaxEachPostBytes',
      field: 'xhttpScMaxEachPostBytes',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.scMinPostsIntervalMs',
      field: 'xhttpScMinPostsIntervalMs',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.reuseSettings.maxConcurrency',
      field: 'xhttpReuseSettingsMaxConcurrency',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.reuseSettings.maxConnections',
      field: 'xhttpReuseSettingsMaxConnections',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.reuseSettings.cMaxReuseTimes',
      field: 'xhttpReuseSettingsCMaxReuseTimes',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.reuseSettings.hMaxRequestTimes',
      field: 'xhttpReuseSettingsHMaxRequestTimes',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.reuseSettings.hMaxReusableSecs',
      field: 'xhttpReuseSettingsHMaxReusableSecs',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.reuseSettings.hKeepAlivePeriod',
      field: 'xhttpReuseSettingsHKeepAlivePeriod',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.path',
      field: 'xhttpDownloadSettingsPath',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.host',
      field: 'xhttpDownloadSettingsHost',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.headers',
      field: 'xhttpDownloadSettingsHeaders',
      codec: 'headersSingle',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.reuseSettings.maxConcurrency',
      field: 'xhttpDownloadSettingsReuseSettingsMaxConcurrency',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.reuseSettings.maxConnections',
      field: 'xhttpDownloadSettingsReuseSettingsMaxConnections',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.reuseSettings.cMaxReuseTimes',
      field: 'xhttpDownloadSettingsReuseSettingsCMaxReuseTimes',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.reuseSettings.hMaxRequestTimes',
      field: 'xhttpDownloadSettingsReuseSettingsHMaxRequestTimes',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.reuseSettings.hMaxReusableSecs',
      field: 'xhttpDownloadSettingsReuseSettingsHMaxReusableSecs',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.reuseSettings.hKeepAlivePeriod',
      field: 'xhttpDownloadSettingsReuseSettingsHKeepAlivePeriod',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.server',
      field: 'xhttpDownloadSettingsServer',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.port',
      field: 'xhttpDownloadSettingsPort',
      codec: 'port',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.tls',
      field: 'xhttpDownloadSettingsTls',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.alpn',
      field: 'xhttpDownloadSettingsAlpn',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.echOpts.enable',
      field: 'xhttpDownloadSettingsEchOptsEnable',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.echOpts.config',
      field: 'xhttpDownloadSettingsEchOptsConfig',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.echOpts.queryServerName',
      field: 'xhttpDownloadSettingsEchOptsQueryServerName',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.shadowTlsOpts.password',
      field: 'xhttpDownloadSettingsShadowTlsOptsPassword',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.shadowTlsOpts.version',
      field: 'xhttpDownloadSettingsShadowTlsOptsVersion',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.restlsOpts.password',
      field: 'xhttpDownloadSettingsRestlsOptsPassword',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.restlsOpts.versionHint',
      field: 'xhttpDownloadSettingsRestlsOptsVersionHint',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.restlsOpts.restlsScript',
      field: 'xhttpDownloadSettingsRestlsOptsRestlsScript',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.jlsOpts.username',
      field: 'xhttpDownloadSettingsJlsOptsUsername',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.jlsOpts.password',
      field: 'xhttpDownloadSettingsJlsOptsPassword',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.realityOpts.publicKey',
      field: 'xhttpDownloadSettingsRealityOptsPublicKey',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.realityOpts.shortId',
      field: 'xhttpDownloadSettingsRealityOptsShortId',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.realityOpts.supportX25519mlkem768',
      field: 'xhttpDownloadSettingsRealityOptsSupportX25519mlkem768',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.skipCertVerify',
      field: 'xhttpDownloadSettingsSkipCertVerify',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.nameCertVerify',
      field: 'xhttpDownloadSettingsNameCertVerify',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.fingerprint',
      field: 'xhttpDownloadSettingsFingerprint',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.certificate',
      field: 'xhttpDownloadSettingsCertificate',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.privateKey',
      field: 'xhttpDownloadSettingsPrivateKey',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.servername',
      field: 'xhttpDownloadSettingsServername',
      network: 'xhttp',
    },
    {
      path: 'xhttpOpts.downloadSettings.clientFingerprint',
      field: 'xhttpDownloadSettingsClientFingerprint',
      network: 'xhttp',
    },
    {
      path: 'xudp',
      field: 'xudp',
    },
  ],
  vmess: [
    {
      path: 'wsOpts.path',
      field: 'path',
      network: 'ws',
    },
    {
      path: 'wsOpts.headers',
      field: 'headers',
      codec: 'headersSingle',
      network: 'ws',
    },
    {
      path: 'wsOpts.maxEarlyData',
      field: 'maxEarlyData',
      network: 'ws',
    },
    {
      path: 'wsOpts.earlyDataHeaderName',
      field: 'earlyDataHeaderName',
      network: 'ws',
    },
    {
      path: 'wsOpts.v2rayHttpUpgrade',
      field: 'wsV2rayHttpUpgrade',
      network: 'ws',
    },
    {
      path: 'wsOpts.v2rayHttpUpgradeFastOpen',
      field: 'wsV2rayHttpUpgradeFastOpen',
      network: 'ws',
    },
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'alpn',
      field: 'alpn',
    },
    {
      path: 'alterId',
      field: 'alterId',
    },
    {
      path: 'authenticatedLength',
      field: 'authenticatedLength',
    },
    {
      path: 'certificate',
      field: 'certificate',
    },
    {
      path: 'cipher',
      field: 'cipher',
    },
    {
      path: 'clientFingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'echOpts.enable',
      field: 'echEnabled',
    },
    {
      path: 'echOpts.config',
      field: 'echConfig',
    },
    {
      path: 'echOpts.queryServerName',
      field: 'echQueryServerName',
    },
    {
      path: 'fingerprint',
      field: 'fingerprint',
    },
    {
      path: 'globalPadding',
      field: 'globalPadding',
    },
    {
      path: 'grpcOpts.grpcServiceName',
      field: 'grpcServiceName',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.grpcUserAgent',
      field: 'grpcUserAgent',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.pingInterval',
      field: 'grpcPingInterval',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.maxConnections',
      field: 'grpcMaxConnections',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.minStreams',
      field: 'grpcMinStreams',
      network: 'grpc',
    },
    {
      path: 'grpcOpts.maxStreams',
      field: 'grpcMaxStreams',
      network: 'grpc',
    },
    {
      path: 'h2Opts.host',
      field: 'headers',
      codec: 'hostHeaders',
      network: 'h2',
    },
    {
      path: 'h2Opts.path',
      field: 'path',
      network: 'h2',
    },
    {
      path: 'httpOpts.method',
      field: 'httpMethod',
      network: 'http',
    },
    {
      path: 'httpOpts.path',
      field: 'paths',
      network: 'http',
    },
    {
      path: 'httpOpts.headers',
      field: 'headers',
      codec: 'headersList',
      network: 'http',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'jlsOpts.username',
      field: 'jlsUsername',
    },
    {
      path: 'jlsOpts.password',
      field: 'jlsPassword',
    },
    {
      path: 'mekyaOpts.url',
      field: 'mekyaUrl',
    },
    {
      path: 'mekyaOpts.h2PoolSize',
      field: 'mekyaH2PoolSize',
    },
    {
      path: 'mekyaOpts.maxWriteDelay',
      field: 'mekyaMaxWriteDelay',
    },
    {
      path: 'mekyaOpts.maxRequestSize',
      field: 'mekyaMaxRequestSize',
    },
    {
      path: 'mekyaOpts.pollingIntervalInitial',
      field: 'mekyaPollingIntervalInitial',
    },
    {
      path: 'mekyaOpts.maxWriteSize',
      field: 'mekyaMaxWriteSize',
    },
    {
      path: 'mekyaOpts.maxWriteDurationMs',
      field: 'mekyaMaxWriteDurationMs',
    },
    {
      path: 'mekyaOpts.maxSimultaneousWriteConnection',
      field: 'mekyaMaxSimultaneousWriteConnection',
    },
    {
      path: 'mekyaOpts.packetWritingBuffer',
      field: 'mekyaPacketWritingBuffer',
    },
    {
      path: 'mekyaOpts.kcp.mtu',
      field: 'mekyaKcpMtu',
    },
    {
      path: 'mekyaOpts.kcp.tti',
      field: 'mekyaKcpTti',
    },
    {
      path: 'mekyaOpts.kcp.uplinkCapacity',
      field: 'mekyaKcpUplinkCapacity',
    },
    {
      path: 'mekyaOpts.kcp.downlinkCapacity',
      field: 'mekyaKcpDownlinkCapacity',
    },
    {
      path: 'mekyaOpts.kcp.congestion',
      field: 'mekyaKcpCongestion',
    },
    {
      path: 'mekyaOpts.kcp.writeBuffer',
      field: 'mekyaKcpWriteBuffer',
    },
    {
      path: 'mekyaOpts.kcp.readBuffer',
      field: 'mekyaKcpReadBuffer',
    },
    {
      path: 'mekyaOpts.kcp.seed',
      field: 'mekyaKcpSeed',
    },
    {
      path: 'mekyaOpts.kcp.header',
      field: 'mekyaKcpHeader',
    },
    {
      path: 'mkcpOpts.mtu',
      field: 'mkcpMtu',
    },
    {
      path: 'mkcpOpts.tti',
      field: 'mkcpTti',
    },
    {
      path: 'mkcpOpts.uplinkCapacity',
      field: 'mkcpUplinkCapacity',
    },
    {
      path: 'mkcpOpts.downlinkCapacity',
      field: 'mkcpDownlinkCapacity',
    },
    {
      path: 'mkcpOpts.congestion',
      field: 'mkcpCongestion',
    },
    {
      path: 'mkcpOpts.writeBuffer',
      field: 'mkcpWriteBuffer',
    },
    {
      path: 'mkcpOpts.readBuffer',
      field: 'mkcpReadBuffer',
    },
    {
      path: 'mkcpOpts.seed',
      field: 'mkcpSeed',
    },
    {
      path: 'mkcpOpts.header',
      field: 'mkcpHeader',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'nameCertVerify',
      field: 'nameCertVerify',
    },
    {
      path: 'network',
      field: 'network',
    },
    {
      path: 'packetAddr',
      field: 'packetAddr',
    },
    {
      path: 'packetEncoding',
      field: 'packetEncoding',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'realityOpts.publicKey',
      field: 'realityPublicKey',
    },
    {
      path: 'realityOpts.shortId',
      field: 'realityShortId',
    },
    {
      path: 'realityOpts.supportX25519mlkem768',
      field: 'realitySupportX25519mlkem768',
    },
    {
      path: 'restlsOpts.password',
      field: 'restlsPassword',
    },
    {
      path: 'restlsOpts.versionHint',
      field: 'restlsVersionHint',
    },
    {
      path: 'restlsOpts.restlsScript',
      field: 'restlsRestlsScript',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'servername',
      field: 'serverName',
    },
    {
      path: 'shadowTlsOpts.password',
      field: 'shadowTlsPassword',
    },
    {
      path: 'shadowTlsOpts.version',
      field: 'shadowTlsVersion',
    },
    {
      path: 'skipCertVerify',
      field: 'allowInsecure',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'tls',
      field: 'tls',
    },
    {
      path: 'tlsmirrorOpts.primaryKey',
      field: 'tlsMirrorPrimaryKey',
    },
    {
      path: 'tlsmirrorOpts.explicitNonceCiphersuites',
      field: 'tlsMirrorExplicitNonceCiphersuites',
    },
    {
      path: 'tlsmirrorOpts.deferInstanceDerivedWriteTime.baseNanoseconds',
      field: 'tlsMirrorDeferInstanceDerivedWriteTimeBaseNanoseconds',
    },
    {
      path: 'tlsmirrorOpts.deferInstanceDerivedWriteTime.uniformRandomMultiplierNanoseconds',
      field: 'tlsMirrorDeferInstanceDerivedWriteTimeUniformRandomMultiplierNanoseconds',
    },
    {
      path: 'tlsmirrorOpts.transportLayerPadding.enabled',
      field: 'tlsMirrorTransportLayerPaddingEnabled',
    },
    {
      path: 'tlsmirrorOpts.connectionEnrolment.primaryIngressOutbound',
      field: 'tlsMirrorConnectionEnrolmentPrimaryIngressOutbound',
    },
    {
      path: 'tlsmirrorOpts.connectionEnrolment.primaryEgressOutbound',
      field: 'tlsMirrorConnectionEnrolmentPrimaryEgressOutbound',
    },
    {
      path: 'tlsmirrorOpts.embeddedTrafficGenerator.steps',
      field: 'tlsMirrorEmbeddedTrafficGeneratorSteps',
    },
    {
      path: 'tlsmirrorOpts.sequenceWatermarkingEnabled',
      field: 'tlsMirrorSequenceWatermarkingEnabled',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'uuid',
      field: 'uuid',
    },
    {
      path: 'xudp',
      field: 'xudp',
    },
  ],
  wireguard: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'amneziaWgOption.version',
      field: 'amneziaWgOptionVersion',
    },
    {
      path: 'amneziaWgOption.jc',
      field: 'amneziaWgOptionJc',
    },
    {
      path: 'amneziaWgOption.jmin',
      field: 'amneziaWgOptionJmin',
    },
    {
      path: 'amneziaWgOption.jmax',
      field: 'amneziaWgOptionJmax',
    },
    {
      path: 'amneziaWgOption.s1',
      field: 'amneziaWgOptionS1',
    },
    {
      path: 'amneziaWgOption.s2',
      field: 'amneziaWgOptionS2',
    },
    {
      path: 'amneziaWgOption.s3',
      field: 'amneziaWgOptionS3',
    },
    {
      path: 'amneziaWgOption.s4',
      field: 'amneziaWgOptionS4',
    },
    {
      path: 'amneziaWgOption.h1',
      field: 'amneziaWgOptionH1',
    },
    {
      path: 'amneziaWgOption.h2',
      field: 'amneziaWgOptionH2',
    },
    {
      path: 'amneziaWgOption.h3',
      field: 'amneziaWgOptionH3',
    },
    {
      path: 'amneziaWgOption.h4',
      field: 'amneziaWgOptionH4',
    },
    {
      path: 'amneziaWgOption.i1',
      field: 'amneziaWgOptionI1',
    },
    {
      path: 'amneziaWgOption.i2',
      field: 'amneziaWgOptionI2',
    },
    {
      path: 'amneziaWgOption.i3',
      field: 'amneziaWgOptionI3',
    },
    {
      path: 'amneziaWgOption.i4',
      field: 'amneziaWgOptionI4',
    },
    {
      path: 'amneziaWgOption.i5',
      field: 'amneziaWgOptionI5',
    },
    {
      path: 'amneziaWgOption.j1',
      field: 'amneziaWgOptionJ1',
    },
    {
      path: 'amneziaWgOption.j2',
      field: 'amneziaWgOptionJ2',
    },
    {
      path: 'amneziaWgOption.j3',
      field: 'amneziaWgOptionJ3',
    },
    {
      path: 'amneziaWgOption.itime',
      field: 'amneziaWgOptionItime',
    },
    {
      path: 'amneziaWgOption.headerProtectionKey',
      field: 'amneziaWgOptionHeaderProtectionKey',
    },
    {
      path: 'amneziaWgOption.contentPaddingAddition',
      field: 'amneziaWgOptionContentPaddingAddition',
    },
    {
      path: 'amneziaWgOption.rekeyAfterTime',
      field: 'amneziaWgOptionRekeyAfterTime',
    },
    {
      path: 'amneziaWgOption.rekeyTimeout',
      field: 'amneziaWgOptionRekeyTimeout',
    },
    {
      path: 'amneziaWgOption.rejectAfterTime',
      field: 'amneziaWgOptionRejectAfterTime',
    },
    {
      path: 'amneziaWgOption.keepaliveTimeout',
      field: 'amneziaWgOptionKeepaliveTimeout',
    },
    {
      path: 'amneziaWgOption.maxHandshakeAttempts',
      field: 'amneziaWgOptionMaxHandshakeAttempts',
    },
    {
      path: 'amneziaWgOption.randomTrailers',
      field: 'amneziaWgOptionRandomTrailers',
    },
    {
      path: 'amneziaWgOption.disableCookies',
      field: 'amneziaWgOptionDisableCookies',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'dns',
      field: 'dnsServers',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ip',
      field: 'localAddresses',
      codec: 'ipv4',
    },
    {
      path: 'ipStack.mode',
      field: 'ipStackMode',
    },
    {
      path: 'ipStack.congestionController',
      field: 'ipStackCongestionController',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'ipv6',
      field: 'localAddresses',
      codec: 'ipv6',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'mtu',
      field: 'mtu',
    },
    {
      path: 'peers',
      field: 'wireGuardPeers',
      codec: 'clashPeers',
    },
    {
      path: 'persistentKeepalive',
      field: 'keepAlive',
    },
    {
      path: 'privateKey',
      field: 'privateKey',
    },
    {
      path: 'refreshServerIpInterval',
      field: 'refreshServerIpInterval',
    },
    {
      path: 'remoteDnsResolve',
      field: 'remoteDnsResolve',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
    {
      path: 'workers',
      field: 'wireGuardWorkers',
    },
  ],
  zerotier: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'dialerProxy',
      field: 'underlyingProxy',
    },
    {
      path: 'dns',
      field: 'dnsServers',
    },
    {
      path: 'encryptedHello',
      field: 'encryptedHello',
    },
    {
      path: 'identitySecret',
      field: 'identitySecret',
    },
    {
      path: 'interfaceName',
      field: 'interfaceName',
    },
    {
      path: 'ipStack.mode',
      field: 'ipStackMode',
    },
    {
      path: 'ipStack.congestionController',
      field: 'ipStackCongestionController',
    },
    {
      path: 'ipVersion',
      field: 'ipVersion',
    },
    {
      path: 'lowBandwidth',
      field: 'lowBandwidth',
    },
    {
      path: 'mptcp',
      field: 'mptcp',
    },
    {
      path: 'mtu',
      field: 'mtu',
    },
    {
      path: 'network',
      field: 'network',
    },
    {
      path: 'orbit',
      field: 'orbit',
    },
    {
      path: 'physicalMtu',
      field: 'physicalMtu',
    },
    {
      path: 'planet',
      field: 'planet',
    },
    {
      path: 'primaryPort',
      field: 'primaryPort',
    },
    {
      path: 'remoteDnsResolve',
      field: 'remoteDnsResolve',
    },
    {
      path: 'remoteTraceLevel',
      field: 'remoteTraceLevel',
    },
    {
      path: 'remoteTraceTarget',
      field: 'remoteTraceTarget',
    },
    {
      path: 'routingMark',
      field: 'routingMark',
    },
    {
      path: 'secondaryPort',
      field: 'secondaryPort',
    },
    {
      path: 'stateDir',
      field: 'stateDir',
    },
    {
      path: 'tcpFallbackMode',
      field: 'tcpFallbackMode',
    },
    {
      path: 'tcpFallbackRelay',
      field: 'tcpFallbackRelay',
    },
    {
      path: 'tfo',
      field: 'tcpFastOpen',
    },
    {
      path: 'udp',
      field: 'udp',
    },
  ],
} as const satisfies { [K in Exclude<(typeof supports)[number], 'https'>]: readonly Binding[] };

export function extract(config: ClashConfig): ClashNode[] {
  return [...(config.proxies ?? []), ...(config.proxy ?? [])].filter(
    (node): node is ClashNode => !['direct', 'reject', 'dns', 'rematch'].includes(node.type),
  );
}

export function readNode(value: unknown): ClashNode {
  const node = clashProxyNode(value);

  if (node.type === 'snell') {
    const version = node.version || 1;

    if (![1, 2, 3, 4, 5].includes(version) || ([1, 2].includes(version) && node.udp === true)) {
      return rejectNode('unsupported-snell-version');
    }
  }

  return node;
}

export const transform = createTransform({
  provider: 'clash',
  supports,
  readNode,
  toFields(node): ProxyNodeFields {
    const type = node.type === 'http' && node.tls ? 'https' : node.type;
    const source = node.type === 'wireguard' ? projectWireGuard(node, 'clash') : { ...node };

    if (node.type === 'snell' && !node.version) {
      put(source, 'version', 1);
    }

    if (node.type === 'mieru' && node.portRange !== undefined) {
      if (Number(node.port ?? 0) !== 0) {
        return rejectNode('ambiguous-mieru-ports');
      }

      remove(source, 'port');
    }

    return flatten(type, source, bindings[node.type]);
  },
  toNode(fields): ClashNode {
    const type = fields.type === 'https' ? 'http' : fields.type;
    const key = supportsType(type, supports);
    const nativeType = key === 'https' ? 'http' : key;
    const implicitTls = ['trojan', 'anytls', 'hysteria', 'hysteria2', 'tuic', 'https'].includes(fields.type);
    const fingerprint = nativeFingerprint(fields);
    const fixed = { ...(implicitTls ? { tls: true } : {}), ...fingerprint.fixed };

    if (get(fields, 'realityEnabled') !== undefined) {
      put(fixed, 'realityEnabled', Boolean(get(fields, 'realityPublicKey')));
    }

    if (get(fields, 'headerType') === 'none') {
      put(fixed, 'headerType', 'none');
    }

    const initial = { type: nativeType, ...(fields.type === 'https' ? { tls: true } : {}) };

    if (fingerprint.value !== undefined) {
      put(initial, 'clientFingerprint', fingerprint.value);
    }

    if (fields.type === 'wireguard') {
      const intervals = fields.wireGuardPeers.map((peer) => peer.keepAlive);

      if (intervals.some((value) => value !== intervals[0])) {
        return rejectNode('unrepresentable-peer-keepalive');
      }

      if (intervals[0] !== undefined) {
        put(initial, 'persistentKeepalive', intervals[0]);
      }

      const portable = {
        ...fields,
        wireGuardPeers: fields.wireGuardPeers.map((peer) => {
          const value = { ...peer };

          remove(value, 'keepAlive');

          return value;
        }),
      };

      return readNode(expand(portable, bindings.wireguard, initial, fixed));
    }

    if (fields.type === 'mieru' && fields.ports !== undefined) {
      if (fields.ports.length !== 1 || Number(fields.ports[0].split(/[:-]/)[0]) !== fields.port) {
        return rejectNode('unrepresentable-mieru-ports');
      }

      put(fixed, 'port', fields.port);
      put(fixed, 'mieruProfile', fields.name);
      put(initial, 'port', 0);

      return readNode(expand(fields, bindings.mieru, initial, fixed));
    }

    return readNode(expand(fields, bindings[nativeType], initial, fixed));
  },
});
