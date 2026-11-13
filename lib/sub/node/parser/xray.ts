import type { Transport } from '../types';
import { oneOf, type ShareUri } from '../uri';

export function transport(kind = 'tcp', fields: Omit<Transport, 'kind'> = {}): Transport {
  const alias = kind === 'raw' ? 'tcp' : kind === 'splithttp' ? 'xhttp' : kind === 'h2' ? 'h2' : kind;

  return { kind: oneOf(alias, ['tcp', 'ws', 'http', 'h2', 'grpc', 'quic', 'kcp', 'httpupgrade', 'xhttp']), ...fields };
}

export function xrayTransport({ get }: ShareUri, kind?: string): Transport {
  return transport(kind || get('type', 'network') || 'tcp', {
    host: get('host', 'ws.host', 'wsHost'),
    path: get('path', 'wspath'),
    edge: get('edge'),
    headerType: get('headerType'),
    serviceName: get('serviceName'),
    mode: get('mode'),
    quicSecurity: get('quicSecurity'),
    quicKey: get('key'),
  });
}

export function xrayOptions(get: (key: string) => string | undefined) {
  return {
    authority: get('authority'),
    extra: get('extra'),
    fm: get('fm'),
    pcs: get('pcs'),
    vcn: get('vcn'),
    seed: get('seed'),
    spx: get('spx'),
  };
}
