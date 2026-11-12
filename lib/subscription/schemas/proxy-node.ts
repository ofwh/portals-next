import { appError } from '@/lib/api';
import { assertJson, isRecord } from '@/lib/shared/data';
import type { NamedType } from '@/lib/types/workflow';
import type { ProxyNode, ProxyProtocol } from '../types/proxy-node';

type Check = (value: unknown) => boolean;
const text: Check = (value) => typeof value === 'string';
const number: Check = (value) => typeof value === 'number' && Number.isFinite(value);
const boolean: Check = (value) => typeof value === 'boolean';
const array =
  (check: Check): Check =>
  (value) =>
    Array.isArray(value) && value.every(check);
const choice =
  (...values: readonly unknown[]): Check =>
  (value) =>
    values.includes(value);
const fields = {
  protocol: choice(
    'ss',
    'ssr',
    'snell',
    'vmess',
    'vless',
    'trojan',
    'socks5',
    'http',
    'https',
    'hysteria',
    'hysteria2',
    'tuic',
    'anytls',
    'naive',
    'wireguard',
    'mieru',
  ),
  name: text,
  server: text,
  port: number,
  sourceId: text,
  sourceGroup: text,
  sourceGroupId: text,
  username: text,
  password: text,
  uuid: text,
  token: text,
  encryption: text,
  alterId: number,
  flow: text,
  packetEncoding: text,
  transport: choice('tcp', 'ws', 'http', 'h2', 'grpc', 'quic', 'kcp', 'httpupgrade', 'xhttp', 'https'),
  host: text,
  path: text,
  edge: text,
  headerType: text,
  serviceName: text,
  mode: text,
  quicSecurity: text,
  quicKey: text,
  tls: boolean,
  serverName: text,
  allowInsecure: boolean,
  disableSni: boolean,
  tls13: boolean,
  alpn: array(text),
  fingerprint: text,
  realityPublicKey: text,
  realityShortId: text,
  ech: text,
  udp: boolean,
  xudp: boolean,
  tcpFastOpen: boolean,
  underlyingProxy: text,
  testUrl: text,
  plugin: text,
  pluginOptions: array(text),
  snellVersion: number,
  snellReuse: boolean,
  snellUdpPort: number,
  snellMode: choice('default', 'unshaped', 'unsafe-raw'),
  shadowTlsPassword: text,
  shadowTlsSni: text,
  shadowTlsVersion: number,
  ssrProtocol: text,
  ssrProtocolParam: text,
  obfs: text,
  obfsParam: text,
  obfsPassword: text,
  portRanges: array((value) => typeof value === 'string' && /^\d+(?:-\d+)?$/.test(value)),
  portRangeTransports: array(choice('tcp', 'udp')),
  up: text,
  down: text,
  hopInterval: text,
  network: choice('udp', 'wechat-video', 'faketcp'),
  certificatePin: text,
  realmUrl: text,
  realmToken: text,
  minPacketSize: number,
  maxPacketSize: number,
  congestionControl: choice('cubic', 'new_reno', 'bbr'),
  udpRelayMode: choice('native', 'quic'),
  reduceRtt: boolean,
  requestTimeoutMs: number,
  idleSessionCheckIntervalSeconds: number,
  idleSessionTimeoutSeconds: number,
  minIdleSession: number,
  insecureConcurrency: number,
  uot: boolean,
  privateKey: text,
  addresses: array(text),
  dns: array(text),
  mtu: number,
  interfaceName: text,
  system: boolean,
  listenPort: number,
  workers: number,
  publicKey: text,
  preSharedKey: text,
  allowedIPs: array(text),
  reserved: array(number),
  keepAlive: number,
  profile: text,
  multiplexing: text,
  handshakeMode: text,
  trafficPattern: text,
  hasUnknownParameters: boolean,
  xrayAuthority: text,
  xrayExtra: text,
  xrayFm: text,
  xrayPcs: text,
  xrayVcn: text,
  xraySeed: text,
  xraySpx: text,
} satisfies Record<keyof ProxyNode, Check>;

const requiredFields = {
  ss: ['encryption', 'password'],
  ssr: ['encryption', 'password', 'ssrProtocol', 'obfs'],
  snell: ['password'],
  vmess: ['uuid', 'encryption', 'alterId'],
  vless: ['uuid', 'encryption'],
  trojan: ['password'],
  socks5: [],
  http: [],
  https: [],
  hysteria: ['portRanges', 'network'],
  hysteria2: ['password', 'portRanges'],
  tuic: ['udpRelayMode', 'requestTimeoutMs'],
  anytls: ['password', 'idleSessionCheckIntervalSeconds', 'idleSessionTimeoutSeconds', 'minIdleSession'],
  naive: ['password', 'transport'],
  wireguard: ['privateKey', 'addresses', 'publicKey'],
  mieru: ['username', 'password', 'profile', 'portRanges', 'portRangeTransports', 'hasUnknownParameters'],
} satisfies Record<ProxyProtocol, readonly (keyof ProxyNode)[]>;

function isProxyNode(value: unknown): value is ProxyNode {
  if (
    !isRecord(value) ||
    !fields.protocol(value.protocol) ||
    !text(value.name) ||
    !text(value.server) ||
    !number(value.port)
  ) {
    return false;
  }

  const checks: Record<string, Check> = fields;

  if (!Object.entries(value).every(([key, entry]) => Object.hasOwn(checks, key) && checks[key](entry))) {
    return false;
  }

  const protocol = value.protocol as ProxyProtocol;

  if (!requiredFields[protocol].every((key) => Object.hasOwn(value, key))) {
    return false;
  }

  if (protocol === 'tuic' && !text(value.token) && !(text(value.uuid) && text(value.password))) {
    return false;
  }

  if (
    protocol === 'mieru' &&
    (!Array.isArray(value.portRanges) ||
      !Array.isArray(value.portRangeTransports) ||
      value.portRanges.length !== value.portRangeTransports.length)
  ) {
    return false;
  }

  return true;
}

export const proxyNodeType: NamedType<ProxyNode> = {
  descriptor: { kind: 'ref', id: 'ProxyNode', version: 1 },
  base: {
    kind: 'record',
    values: {
      kind: 'union',
      types: [
        { kind: 'string' },
        { kind: 'number' },
        { kind: 'boolean' },
        { kind: 'array', items: { kind: 'union', types: [{ kind: 'string' }, { kind: 'number' }] } },
      ],
    },
  },
  parse(value) {
    assertJson(value);
    if (!isProxyNode(value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return value;
  },
};
