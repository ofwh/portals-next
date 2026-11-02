import {
  array,
  boolean,
  entries,
  json,
  nodeItems,
  number,
  oneOf,
  optional,
  port,
  shape,
  stringOrNumber,
  text,
  union,
} from '../../schema';
import type { V2RayConfig } from '../../types/v2ray';

const headers = entries(union(text, array(text)));

const tcpSettings = shape({
  header: optional(
    shape({
      type: optional(text),
      request: optional(
        shape({
          path: optional(array(text)),
          headers: optional(headers),
          version: optional(text),
          method: optional(text),
        }),
      ),
      response: optional(
        shape({ version: optional(text), status: optional(text), reason: optional(text), headers: optional(headers) }),
      ),
    }),
  ),
});

const wsSettings = shape({
  path: optional(text),
  headers: optional(headers),
  maxEarlyData: optional(number),
  earlyDataHeaderName: optional(text),
});

const streamSettings = shape({
  network: optional(text),
  security: optional(text),
  tcpSettings: optional(tcpSettings),
  tcpsettings: optional(tcpSettings),
  wsSettings: optional(wsSettings),
  wssettings: optional(wsSettings),
  tlsSettings: optional(
    shape({
      serverName: optional(text),
      allowInsecure: optional(boolean),
      alpn: optional(array(text)),
      fingerprint: optional(text),
    }),
  ),
  grpcSettings: optional(shape({ serviceName: optional(text), multiMode: optional(boolean) })),
  httpSettings: optional(shape({ host: optional(array(text)), path: optional(text) })),
});

export const v2rayProxyNode = shape({
  protocol: oneOf('vmess'),
  tag: optional(text),
  settings: shape({
    vnext: array(
      shape({
        address: text,
        port,
        users: array(shape({ id: text, alterId: optional(number), security: optional(text) })),
      }),
    ),
  }),
  streamSettings: optional(streamSettings),
  streamsettings: optional(streamSettings),
  mux: optional(
    shape({
      enabled: optional(boolean),
      concurrency: optional(number),
      xudpConcurrency: optional(number),
      xudpProxyUDP443: optional(text),
    }),
  ),
});

export const v2rayNProxyNode = shape({
  address: text,
  port,
  id: text,
  configType: number,
  remarks: optional(text),
  subid: optional(text),
  alterId: optional(stringOrNumber),
  security: optional(text),
  network: optional(text),
  headerType: optional(text),
  requestHost: optional(text),
  path: optional(text),
  streamSecurity: optional(text),
  sni: optional(text),
  allowInsecure: optional(boolean),
});

export const v2rayConfig = union(
  shape({
    outbounds: nodeItems(
      union(
        v2rayProxyNode,
        shape({
          protocol: oneOf('freedom', 'blackhole', 'dns', 'loopback'),
          tag: optional(text),
          settings: optional(
            shape({
              domainStrategy: optional(text),
              redirect: optional(text),
              userLevel: optional(number),
              response: optional(shape({ type: optional(text) })),
              address: optional(text),
              port: optional(port),
              network: optional(text),
              inboundTag: optional(text),
            }),
          ),
        }),
      ),
      'v2ray',
    ),
  }),
  shape({ vmess: nodeItems(v2rayNProxyNode, 'v2ray'), subItem: optional(array(shape({ id: text, remarks: text }))) }),
);

export function parse(content: string): V2RayConfig {
  return v2rayConfig(json(content));
}
