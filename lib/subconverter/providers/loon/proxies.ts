import { appError } from '@/lib/api';
import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { normalizeProxy } from '../../normalize';
import { proxyTypes } from '../../proxy-types';
import type { ClashProxy } from '../../types/clash';
import type { LoonConfig } from '../../types/loon';

export function extractLoon(content: string): ClashProxy[] {
  const nodes: ClashProxy[] = [];
  let section = '';
  const hasSections = /^\s*\[/m.test(content);

  for (const line of content.split(/\r?\n/)) {
    const text = line.trim();

    if (!text || /^[#;]/.test(text)) {
      continue;
    }

    if (text.startsWith('[')) {
      section = text.toLowerCase();
      continue;
    }

    if (hasSections && section !== '[proxy]') {
      continue;
    }

    const separator = text.indexOf('=');

    if (separator < 0) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    const fields =
      text
        .slice(separator + 1)
        .match(/(?:"(?:[^"\\]|\\.)*"|[^,])+/g)
        ?.map((v) => v.trim()) ?? [];
    const unquote = (v: string) => (v.startsWith('"') ? String(JSON.parse(v)) : v);
    const kind = fields[0]?.toLowerCase();
    const type = kind === 'shadowsocks' ? 'ss' : kind === 'shadowsocksr' ? 'ssr' : kind;

    if (!type || !proxyTypes[type]) {
      throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
    }

    const node: ClashProxy = {
      name: unquote(text.slice(0, separator).trim()),
      type,
      server: fields[1],
      port: Number(fields[2]),
    };
    const cipher = ['ss', 'ssr', 'vmess'].includes(type);

    node[cipher ? 'cipher' : 'password'] = unquote(fields[3] ?? '');
    if (cipher) {
      node[type === 'vmess' ? 'uuid' : 'password'] = unquote(fields[4] ?? '');
    } else if (type === 'vless') {
      node.uuid = node.password;
      delete node.password;
    }

    const options: Record<string, string> = {};

    for (const item of fields.slice(cipher ? 5 : 4)) {
      const index = item.indexOf('=');

      if (index < 1) {
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
      }

      options[item.slice(0, index).trim()] = unquote(item.slice(index + 1).trim());
    }
    const mapping: Record<string, string> = {
      transport: 'network',
      path: 'path',
      host: 'host',
      sni: 'sni',
      'tls-name': 'sni',
      flow: 'flow',
      'public-key': 'public-key',
      'short-id': 'short-id',
      'tls-profile': 'fingerprint',
      'salamander-password': 'obfs-password',
      protocol: 'protocol',
      obfs: 'obfs',
    };

    for (const [key, value] of Object.entries(options)) {
      if (mapping[key]) {
        node[mapping[key]] = value;
      } else if (['over-tls', 'skip-cert-verify', 'udp', 'udp-relay', 'fast-open', 'tfo'].includes(key)) {
        if (!['true', 'false'].includes(value)) {
          throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
        }

        node[key === 'over-tls' ? 'tls' : key === 'udp-relay' ? 'udp' : key === 'fast-open' ? 'tfo' : key] =
          value === 'true';
      } else if (key === 'alterid') {
        node.alterId = Number(value);
      } else {
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
      }
    }
    nodes.push(node);
  }

  return nodes;
}

export function parse(config: LoonConfig): ProxyNode[] {
  return extractLoon((config.Proxy ?? []).join('\n')).map(normalizeProxy);
}

export function format(nodes: ProxyNode[], _config?: LoonConfig): LoonConfig {
  return {
    Proxy: nodes.map((node) => {
      const names: Partial<Record<ProxyNode['type'], string>> = {
        Shadowsocks: 'Shadowsocks',
        VMess: 'vmess',
        VLESS: 'vless',
        Trojan: 'trojan',
        AnyTLS: 'anytls',
        Hysteria2: 'hysteria2',
      };
      const kind = names[node.type];

      if (!kind) {
        throw new Error(`Protocol ${node.type} is not supported by this Loon adapter`);
      }

      const credential = JSON.stringify(['VMess', 'VLESS'].includes(node.type) ? node.userId : node.password);
      const fields = [kind, node.hostname, String(node.port)];

      if (['Shadowsocks', 'VMess'].includes(node.type)) {
        fields.push(node.encryptMethod || 'auto');
      }

      fields.push(credential);
      if (['VMess', 'VLESS'].includes(node.type)) {
        fields.push(`transport=${node.transferProtocol || 'tcp'}`, `over-tls=${node.tlsSecure}`);
      }

      if (node.serverName) {
        fields.push(`sni=${node.serverName}`);
      }

      if (node.path) {
        fields.push(`path=${node.path}`);
      }

      if (node.host) {
        fields.push(`host=${node.host}`);
      }

      return `${JSON.stringify(node.remark)} = ${fields.join(', ')}`;
    }),
  };
}
