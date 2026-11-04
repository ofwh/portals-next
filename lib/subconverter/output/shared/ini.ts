import { fail } from './errors';
import { camelCase } from '../../providers/schema';
import type { OutputParts } from '../../types/output';
import type { IniNode, IniSection } from '../../types/providers/ini';

const optionNames =
  'uuid ws over-tls protocol protocol-param congestion-controller udp-relay-mode aead alpn alterid block-quic custom direct dns dns-server dnsv6 download-bandwidth encrypt-method fast-open fingerprint flow fp grpc-mode host interface-ip interface-ip-v6 interface-ipv6 keepalive method mode mtu obfs obfs-host obfs-uri password path peer peers pre-shared-key preshared-key private-key psk public-key reality-base64-pubkey reality-hex-shortid reject reject-tinygif reuse salamander-password section-name self-ip self-ipv6 self-ip-v6 service-name shadow-tls-password shadow-tls-sni shadow-tls-version short-id skip-cert-verify sni ssr-protocol ssr-protocol-param tag test-url tfo tls tls-alpn tls-cert-sha256 tls-host tls-name tls-profile tls-pubkey-sha256 tls-verification tls13 transport udp udp-port udp-relay username version vless-flow vmess-aead ws-headers ws-path'.split(
    ' ',
  );
const nativeNames = new Map(optionNames.map((key) => [camelCase(key), key]));

export function token(value: string): string {
  if (/[\r\n\0]/.test(value)) {
    return fail('assembly', -1, 'text', 'invalid-ini-line-break');
  }

  return /[,="'()\[\]#;]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
}

export interface IniNodeProjection {
  lines: string[];
  sections: IniSection[];
}
export interface IniRuleProjection {
  local: string[];
  remote: string[];
}
export interface IniDocument {
  sections: IniSection[];
}

export function projectNode(node: IniNode, index: number, style: 'surge' | 'loon' | 'quanx'): IniNodeProjection {
  if (node.wireGuard) {
    if (style === 'loon') {
      return projectLoonWireGuard(node, index);
    }

    if (style !== 'surge') {
      return fail('node', index, 'wireGuard', 'unsupported-wireguard-layout');
    }

    const section = `generated-${index}`;
    const settings = node.wireGuard;
    const lines = [`private-key = ${token(settings.privateKey)}`];

    for (const address of settings.addresses) {
      lines.push(`${address.includes(':') ? 'self-ip-v6' : 'self-ip'} = ${token(address.split('/')[0])}`);
    }
    if (settings.mtu !== undefined) {
      lines.push(`mtu = ${settings.mtu}`);
    }

    if (settings.dnsServers?.length) {
      lines.push(`dns-server = ${token(settings.dnsServers.join(', '))}`);
    }

    if (settings.keepAlive !== undefined) {
      return fail('node', index, 'keepAlive', 'unsupported-wireguard-keepalive');
    }

    lines.push(
      `peer = ${settings.peers
        .map((peer) => {
          const endpoint = `${peer.server.includes(':') ? `[${peer.server}]` : peer.server}:${peer.port}`;
          const fields = [`public-key = ${token(peer.publicKey)}`, `endpoint = ${token(endpoint)}`];

          if (peer.preSharedKey !== undefined) {
            fields.push(`preshared-key = ${token(peer.preSharedKey)}`);
          }

          if (peer.allowedIps?.length) {
            fields.push(`allowed-ips = ${token(peer.allowedIps.join(', '))}`);
          }

          if (peer.reserved?.length) {
            fields.push(`client-id = ${peer.reserved.join('/')}`);
          }

          if (peer.keepAlive !== undefined) {
            fields.push(`keepalive = ${peer.keepAlive}`);
          }

          return `(${fields.join(', ')})`;
        })
        .join(',')}`,
    );

    return {
      lines: [`${token(node.name)} = wireguard, section-name=${token(section)}`],
      sections: [{ name: `WireGuard ${section}`, lines }],
    };
  }

  const options = Object.entries(node.options).flatMap(([key, value]) => {
    if (value === undefined) {
      return [];
    }

    const native = nativeNames.get(key);

    if (!native) {
      return fail('node', index, key, 'unsupported-ini-option');
    }

    if (style === 'quanx' && key === 'skipCertVerify') {
      return [`tls-verification=${value === 'true' ? 'false' : 'true'}`];
    }

    return [`${native}=${token(value)}`];
  });
  const left = style === 'quanx' ? node.type : token(node.name);
  const fields = [...(style === 'quanx' ? [] : [node.type]), ...node.arguments.map(token), ...options];

  return { lines: [`${left} = ${fields.join(', ')}`], sections: [] };
}

export function combineIni(
  parts: OutputParts<IniNodeProjection, IniRuleProjection, string[]>,
  names: { nodes: string; policies: string; rules: string; remote?: string },
): IniDocument {
  const sections: IniSection[] = [
    { name: names.nodes, lines: parts.nodes.entries.flatMap((entry) => entry.value.lines) },
    { name: names.policies, lines: parts.policies.value },
    { name: names.rules, lines: parts.rules.value.local },
    ...parts.nodes.entries.flatMap((entry) => entry.value.sections),
  ];

  if (names.remote && parts.rules.value.remote.length) {
    sections.push({ name: names.remote, lines: parts.rules.value.remote });
  }

  return { sections };
}

export function stringifyIni(config: IniDocument): string {
  return config.sections.map((section) => `[${section.name}]\n${section.lines.join('\n')}`).join('\n\n') + '\n';
}

function projectLoonWireGuard(node: IniNode, index: number): IniNodeProjection {
  const settings = node.wireGuard!;
  const options: string[] = [];
  const keepAlive = settings.peers[0]?.keepAlive ?? settings.keepAlive;

  if (settings.peers.some((peer) => peer.keepAlive !== undefined && peer.keepAlive !== keepAlive)) {
    return fail('node', index, 'keepAlive', 'inconsistent-loon-wireguard-keepalive');
  }

  for (const address of settings.addresses) {
    options.push(`${address.includes(':') ? 'interface-ipV6' : 'interface-ip'}=${token(address.split('/')[0])}`);
  }
  options.push(`private-key=${token(settings.privateKey)}`);
  for (const dns of settings.dnsServers ?? []) {
    options.push(`${dns.includes(':') ? 'dnsV6' : 'dns'}=${token(dns)}`);
  }
  if (settings.mtu !== undefined) {
    options.push(`mtu=${settings.mtu}`);
  }

  if (keepAlive !== undefined) {
    options.push(`keepalive=${keepAlive}`);
  }

  const peers = settings.peers.map((peer) => {
    const fields = [
      `public-key=${token(peer.publicKey)}`,
      `endpoint=${token(`${peer.server.includes(':') ? `[${peer.server}]` : peer.server}:${peer.port}`)}`,
    ];

    if (peer.preSharedKey !== undefined) {
      fields.push(`preshared-key=${token(peer.preSharedKey)}`);
    }

    if (peer.allowedIps?.length) {
      fields.push(`allowed-ips=${token(peer.allowedIps.join(', '))}`);
    }

    if (peer.reserved?.length) {
      fields.push(`reserved=[${peer.reserved.join(',')}]`);
    }

    return `{${fields.join(',')}}`;
  });

  options.push(`peers=[${peers.join(',')}]`);

  return { lines: [`${token(node.name)} = wireguard, ${options.join(', ')}`], sections: [] };
}
