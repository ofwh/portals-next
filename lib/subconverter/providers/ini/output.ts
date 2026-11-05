import type { IniStyle } from './transform';
import { rejectNode } from '../../proxy-node/debug';
import { convert, get, put, remove } from '../../proxy-node/mapping';
import type { IniProxyOptions } from '../../types/providers/ini';
import type { ProxyNodeFields } from '../../types/proxy-node';
import { text } from '../schema';

function rename(options: IniProxyOptions, from: keyof IniProxyOptions, to: keyof IniProxyOptions) {
  const value = options[from];

  if (value !== undefined) {
    delete options[from];
    options[to] = value;
  }
}

export function projectOptions(fields: ProxyNodeFields, style: IniStyle, options: IniProxyOptions): void {
  if (fields.type === 'vmess') {
    const cipher = fields.cipher === 'chacha20-ietf-poly1305' ? 'chacha20-poly1305' : fields.cipher;

    if (style === 'surge') {
      if (cipher === 'aes-128-gcm' || cipher === 'chacha20-poly1305') {
        put(options, 'encryptMethod', cipher === 'chacha20-poly1305' ? 'chacha20-ietf-poly1305' : cipher);
      } else {
        remove(options, 'encryptMethod');
      }

      if (fields.alterId !== undefined) {
        put(options, 'vmessAead', String(fields.alterId === 0));
      }

      remove(options, 'alterid');
    } else if (style === 'quanx') {
      if (cipher !== undefined) {
        put(options, 'method', cipher === 'none' ? 'none' : 'chacha20-poly1305');
      }

      if (fields.alterId !== undefined) {
        put(options, 'aead', String(fields.alterId === 0));
      }

      remove(options, 'encryptMethod', 'alterid');
    } else if (cipher === 'chacha20-poly1305') {
      put(options, 'encryptMethod', 'chacha20-ietf-poly1305');
    }
  }

  if (style === 'loon' || style === 'quanx') {
    rename(options, 'tfo', 'fastOpen');
  }

  if (style === 'loon') {
    rename(options, 'udpRelay', 'udp');
  }

  if (style !== 'surge' && 'headers' in fields && fields.headers) {
    put(options, 'host', convert(fields.headers, 'hostHeaderSingle', true));
    remove(options, 'wsHeaders');
  }

  if (style === 'quanx') {
    const implicitTls = ['trojan', 'anytls', 'hysteria2', 'tuic', 'https'].includes(fields.type);
    const tls = get(fields, 'tls') === true || implicitTls || get(fields, 'realityPublicKey') !== undefined;
    const network = get(fields, 'network') ?? 'tcp';
    const serverName = get(fields, 'serverName');

    if (['vmess', 'vless', 'trojan'].includes(fields.type)) {
      if (network === 'ws') {
        const host = options.host ?? serverName ?? get(fields, 'server');
        const sni = serverName ?? host;

        if (tls && text(host).toLowerCase() !== text(sni).toLowerCase()) {
          rejectNode('unsupported-transport');
        }

        put(options, 'obfs', tls ? 'wss' : 'ws');
        if (options.host !== undefined || serverName !== undefined) {
          put(options, 'obfsHost', host);
        }
      } else if (fields.type === 'trojan') {
        put(options, 'overTls', 'true');
        remove(options, 'obfs');
        if (serverName !== undefined) {
          put(options, 'tlsHost', serverName);
        }
      } else if (tls) {
        put(options, 'obfs', 'over-tls');
        if (serverName !== undefined) {
          put(options, 'obfsHost', serverName);
        }
      }

      rename(options, 'path', 'obfsUri');
      if (network === 'ws') {
        remove(options, 'overTls');
      }
    } else if (tls) {
      put(options, 'overTls', 'true');
      rename(options, 'sni', 'tlsHost');
    }

    if (fields.type === 'ss' && fields.plugin === 'v2ray-plugin') {
      if (fields.pluginMode && fields.pluginMode !== 'websocket') {
        rejectNode('unsupported-ss-plugin');
      }

      put(options, 'obfs', fields.pluginTls ? 'wss' : 'ws');
      if (fields.pluginPath !== undefined) {
        put(options, 'obfsUri', fields.pluginPath);
      }
    }

    if (fields.type === 'ssr') {
      rename(options, 'protocol', 'ssrProtocol');
      rename(options, 'protocolParam', 'ssrProtocolParam');
      rename(options, 'obfsParam', 'obfsHost');
    }

    rename(options, 'publicKey', 'realityBase64Pubkey');
    rename(options, 'shortId', 'realityHexShortid');
    rename(options, 'flow', 'vlessFlow');

    const alpn = get(fields, 'alpn');

    if (Array.isArray(alpn)) {
      const encoded = alpn
        .map((protocol: unknown) => {
          const bytes = Buffer.from(text(protocol), 'utf8');

          if (!bytes.length || bytes.length > 255) {
            return rejectNode('unrepresentable-alpn');
          }

          return bytes.length.toString(16).padStart(2, '0') + bytes.toString('hex');
        })
        .join('');

      put(options, 'tlsAlpn', encoded);
    }

    remove(options, 'sni', 'host', 'alpn', 'tlsProfile', 'pluginTls', 'pluginPath');
  }

  if (fields.type === 'hysteria2') {
    if (fields.obfsPassword) {
      if (fields.obfs !== 'salamander' && !(style === 'surge' && fields.obfs === 'gecko')) {
        rejectNode('unsupported-obfuscation');
      }

      put(options, fields.obfs === 'gecko' ? 'geckoPassword' : 'salamanderPassword', fields.obfsPassword);
    }

    remove(options, 'obfs');
    if (style === 'loon') {
      rename(options, 'portHopping', 'serverPorts');
    }

    if (style === 'surge') {
      const ports = options.portHopping;

      if (ports !== undefined) {
        put(options, 'portHopping', text(ports).replaceAll(',', ';'));
      }

      rename(options, 'hopInterval', 'portHoppingInterval');
    }
  }
}
