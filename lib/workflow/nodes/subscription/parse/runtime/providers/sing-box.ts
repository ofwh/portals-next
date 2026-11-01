import { appError } from '@/lib/api';
import type { FormatParser } from './types';
import { isRecord } from '../../../../../utils';
import { durationSeconds } from '../duration';
import { decodeBase64Utf8 } from '../encoding';

export function convertSingBoxOutbound(value: unknown): Record<string, unknown> | undefined {
  if (
    !isRecord(value) ||
    !['shadowsocks', 'vmess', 'vless', 'trojan', 'hysteria', 'hysteria2', 'anytls'].includes(String(value.type))
  ) {
    return undefined;
  }

  const type = value.type === 'shadowsocks' ? 'ss' : value.type;
  const result: Record<string, unknown> = {
    name: value.tag || value.server,
    type,
    server: value.server,
    port: value.server_port,
  };

  if (value.tcp_fast_open !== undefined) {
    result.tfo = value.tcp_fast_open;
  }

  if (type === 'ss') {
    result.cipher = value.method;
    result.password = value.password;
    if (value.plugin !== undefined) {
      result.plugin = ['obfs-local', 'simple-obfs'].includes(String(value.plugin)) ? 'obfs' : value.plugin;
      if (typeof value.plugin_opts === 'string') {
        result['plugin-opts'] = Object.fromEntries(
          value.plugin_opts
            .split(';')
            .filter(Boolean)
            .map((part) => {
              const separator = part.indexOf('=');
              const key = separator < 0 ? part : part.slice(0, separator);
              const content = separator < 0 ? true : part.slice(separator + 1);

              return [key === 'obfs' ? 'mode' : key === 'obfs-host' ? 'host' : key, content];
            }),
        );
      }
    }
  } else if (type === 'vmess' || type === 'vless') {
    result.uuid = value.uuid;
    if (type === 'vmess') {
      result.cipher = value.security ?? 'auto';
      result.alterId = value.alter_id ?? 0;
    } else if (value.flow !== undefined) {
      result.flow = value.flow;
    }
  } else if (type === 'hysteria') {
    result.up = value.up ?? value.up_mbps;
    result.down = value.down ?? value.down_mbps;
    if (value.auth_str !== undefined) {
      result['auth-str'] = value.auth_str;
    } else if (typeof value.auth === 'string') {
      result['auth-str'] = decodeBase64Utf8(value.auth);
    }

    if (value.obfs !== undefined) {
      result.obfs = value.obfs;
    }
  } else {
    result.password = value.password;
    if (type === 'hysteria2') {
      if (value.obfs !== undefined) {
        if (!isRecord(value.obfs)) {
          throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
        }

        result.obfs = value.obfs.type;
        result['obfs-password'] = value.obfs.password;
      }

      if (value.up_mbps !== undefined) {
        result.up = value.up_mbps;
      }

      if (value.down_mbps !== undefined) {
        result.down = value.down_mbps;
      }

      if (value.server_ports !== undefined) {
        if (
          !Array.isArray(value.server_ports) ||
          !value.server_ports.every((item) => typeof item === 'string' && /^\d+(?::\d+)?$/.test(item))
        ) {
          throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
        }

        result.ports = value.server_ports.map((item) => item.replace(':', '-')).join(',');
        if (result.port === undefined) {
          result.port = Number(value.server_ports[0]?.split(':')[0]);
        }
      }
    }

    if (type === 'anytls') {
      if (value.idle_session_check_interval !== undefined) {
        result['idle-session-check-interval'] = durationSeconds(value.idle_session_check_interval);
      }

      if (value.idle_session_timeout !== undefined) {
        result['idle-session-timeout'] = durationSeconds(value.idle_session_timeout);
      }

      if (value.min_idle_session !== undefined) {
        result['min-idle-session'] = value.min_idle_session;
      }
    }
  }

  if (value.tls !== undefined) {
    if (!isRecord(value.tls)) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    const tls = value.tls;

    if (tls.enabled === true) {
      result.tls = true;
      if (tls.server_name !== undefined) {
        result[type === 'trojan' || type === 'hysteria' || type === 'hysteria2' ? 'sni' : 'servername'] =
          tls.server_name;
      }

      if (tls.insecure !== undefined) {
        result['skip-cert-verify'] = tls.insecure;
      }

      if (tls.alpn !== undefined) {
        result.alpn = tls.alpn;
      }

      if (isRecord(tls.utls) && tls.utls.enabled === true && tls.utls.fingerprint !== undefined) {
        result['client-fingerprint'] = tls.utls.fingerprint;
      }

      if (isRecord(tls.reality) && tls.reality.enabled === true) {
        result['reality-opts'] = { 'public-key': tls.reality.public_key, 'short-id': tls.reality.short_id };
      }
    }
  }

  if (value.transport !== undefined) {
    if (!isRecord(value.transport)) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    const transport = value.transport;

    switch (transport.type) {
      case 'ws':
        result.network = 'ws';
        result['ws-opts'] = {
          path: transport.path ?? '/',
          headers: transport.headers,
          'max-early-data': transport.max_early_data,
          'early-data-header-name': transport.early_data_header_name,
        };
        break;
      case 'grpc':
        result.network = 'grpc';
        result['grpc-opts'] = { 'grpc-service-name': transport.service_name ?? '' };
        break;
      case 'http': {
        result.network = 'http';
        const headers: Record<string, unknown> = isRecord(transport.headers)
          ? Object.fromEntries(
              Object.entries(transport.headers).map(([key, item]) => [key, Array.isArray(item) ? item : [item]]),
            )
          : {};

        if (transport.host !== undefined) {
          headers.Host = transport.host;
        }

        result['http-opts'] = { path: [transport.path ?? '/'], headers };
        break;
      }
      default:
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }
  }

  return result;
}

export const singBoxProvider = {
  matches(content) {
    try {
      const value: unknown = JSON.parse(content);

      return isRecord(value)
        ? 'outbounds' in value
        : Array.isArray(value) && value.some((item: unknown) => isRecord(item) && 'server_port' in item);
    } catch {
      return false;
    }
  },
  extract(content) {
    const value: unknown = JSON.parse(content);
    const outbounds = Array.isArray(value) ? value : isRecord(value) ? value.outbounds : undefined;

    if (!Array.isArray(outbounds)) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    return outbounds.map(convertSingBoxOutbound).filter((node) => node !== undefined);
  },
} satisfies FormatParser;
