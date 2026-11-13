import { isRecord } from '@/lib/shared/data';
import type { ProxyNode } from '../../shared/types';
import { assemble } from '../producers';
import type {
  CompiledNode,
  CompileOptions,
  NodeDefinition,
  NodeModule,
  NodeProvider,
  NodeSerialization,
  NodeSource,
  Schema,
  Source,
  SubscriptionType,
  TemplateModule,
} from '../types';

type NodeModuleDefinition = Pick<NodeModule, 'type' | 'nodes' | 'serialize'>;

function setProperty(target: Source, key: string, value: unknown): void {
  Object.defineProperty(target, key, { value, enumerable: true, configurable: true, writable: true });
}

export function transform<T extends object>(source: T, schema: Schema<T>): Source {
  const result: Source = {};

  for (const [key, rule] of Object.entries(schema)) {
    if (typeof rule === 'string') {
      if (Object.hasOwn(source, rule) && source[rule] !== undefined) {
        setProperty(result, key, source[rule]);
      }

      continue;
    }

    if (rule.kind === 'field') {
      let value: unknown = Object.hasOwn(source, rule.source) ? source[rule.source] : undefined;

      if (value === undefined && Object.hasOwn(rule, 'default')) {
        value = rule.default;
      }

      if (value === undefined || (rule.when && !rule.when(value, source))) {
        continue;
      }

      if (rule.transform) {
        value = rule.transform(value, source);
      }

      if (value !== undefined) {
        setProperty(result, key, value);
      }

      continue;
    }

    if (rule.kind === 'object') {
      if (rule.when && !rule.when(source)) {
        continue;
      }

      const nested = transform(source, rule.fields);

      if (Object.keys(nested).length > 0) {
        setProperty(result, key, nested);
      }

      continue;
    }

    if (!Object.hasOwn(source, rule.source)) {
      continue;
    }

    const value: unknown = source[rule.source];

    if (!Array.isArray(value) || (rule.when && !rule.when(value, source))) {
      continue;
    }

    const items = value
      .map((item: unknown, index) => {
        if (rule.transformItem) {
          return rule.transformItem(item, index, source);
        }

        return rule.items && isRecord(item) ? transform(item, rule.items) : item;
      })
      .filter((item) => item !== undefined);

    setProperty(result, key, items);
  }

  return result;
}

function resolve(
  node: ProxyNode,
  provider: NodeModuleDefinition,
  context: CompileOptions,
): { definition: NodeDefinition; source: NodeSource } | undefined {
  const definition = Object.hasOwn(provider.nodes, node.protocol) ? provider.nodes[node.protocol] : undefined;
  const index = context.index ?? 0;

  if (!definition || !Number.isInteger(index) || index < 0) {
    return;
  }

  const source: NodeSource = {
    ...node,
    name: node.name.replaceAll('=', '-'),
    index,
    sectionName: context.sectionName ?? `subscription-${index + 1}`,
    options: context.options,
  };

  if (definition.when && !definition.when(source)) {
    return;
  }

  return { definition, source };
}

function transformNode(
  node: ProxyNode,
  provider: NodeModuleDefinition,
  context: CompileOptions = {},
): { definition: NodeDefinition; source: NodeSource; value: Source } | undefined {
  const resolved = resolve(node, provider, context);

  return resolved ? { ...resolved, value: transform(resolved.source, resolved.definition.schema) } : undefined;
}

function safe(value: string | undefined, quoted = false): boolean {
  return !/[\r\n\x00-\x1f\x7f]/.test(value ?? '') && !(quoted ? /"/ : /,/).test(value ?? '');
}

function commonSafe(node: Readonly<NodeSource>): boolean {
  return (
    !!node.server &&
    Number.isInteger(node.port) &&
    node.port > 0 &&
    node.port <= 65535 &&
    safe(node.server) &&
    !/[\r\n[\]]/.test(node.sectionName) &&
    safe(node.name.replace(/^"|"$/g, ''), true) &&
    [node.username, node.serverName, node.host, node.encryption, node.certificatePin, node.fingerprint].every((value) =>
      safe(value),
    ) &&
    (node.alpn ?? []).every((value) => safe(value, true))
  );
}

function wireguardSafe(node: Readonly<NodeSource>): boolean {
  return [node.privateKey, node.publicKey, node.preSharedKey, node.testUrl, ...(node.dns ?? [])].every(
    (value) => safe(value) && !/["()]/.test(value ?? ''),
  );
}

function surgeSafe(node: Readonly<NodeSource>): boolean {
  if (!safe(node.underlyingProxy)) {
    return false;
  }

  switch (node.protocol) {
    case 'ss':
      return safe(node.password) && !node.pluginOptions?.some((value) => !safe(value));
    case 'socks5':
    case 'http':
    case 'https':
    case 'trojan':
      return safe(node.password);
    case 'vmess':
    case 'vless':
      return [
        node.uuid,
        node.path,
        node.edge,
        node.mode,
        node.xrayAuthority,
        node.flow,
        node.realityPublicKey,
        node.realityShortId,
      ].every((value) => safe(value));
    case 'wireguard':
      return wireguardSafe(node);
    case 'hysteria2':
    case 'tuic':
    case 'anytls':
      return [
        node.password,
        node.token,
        node.alpn?.[0],
        node.certificatePin,
        node.fingerprint,
        node.obfsPassword,
      ].every((value) => safe(value));
    case 'snell':
      return [node.password, node.path, node.shadowTlsPassword, node.shadowTlsSni].every((value) => safe(value));
    case 'ssr':
      return [
        node.server,
        node.encryption,
        node.password,
        node.obfs,
        node.ssrProtocol,
        node.obfsParam,
        node.ssrProtocolParam,
      ].every((value) => safe(value, true) && !value?.includes('\\'));
    default:
      return true;
  }
}

function loonSafe(node: Readonly<NodeSource>): boolean {
  if (!safe(node.username, true) || !safe(node.uuid, true)) {
    return false;
  }

  if (node.protocol === 'wireguard') {
    return wireguardSafe(node);
  }

  if (['vmess', 'vless', 'trojan'].includes(node.protocol) && !safe(node.path)) {
    return false;
  }

  if (node.protocol === 'vmess' || node.protocol === 'vless') {
    return true;
  }

  return safe(node.password, true) && (node.protocol !== 'hysteria2' || safe(node.obfsPassword, true));
}

function validate(node: Readonly<NodeSource>, target: SubscriptionType): boolean {
  if (!['surge', 'surfboard', 'loon', 'quanx'].includes(target)) {
    return true;
  }

  if (!commonSafe(node)) {
    return false;
  }

  if (target === 'surge') {
    return surgeSafe(node);
  }

  if (target === 'surfboard') {
    return (
      surgeSafe(node) &&
      [node.password, node.uuid, node.path, node.edge, node.obfsPassword].every((value) => safe(value))
    );
  }

  if (target === 'loon') {
    return loonSafe(node);
  }

  if (target === 'quanx') {
    return (
      safe(node.password) &&
      (!['vmess', 'vless', 'trojan', 'anytls'].includes(node.protocol) ||
        [node.path, node.realityPublicKey, node.realityShortId].every((value) => safe(value)))
    );
  }

  return true;
}

export function serialize(value: Source, definition: NodeDefinition, separator = ', '): NodeSerialization {
  const positional = definition.positional ?? [];
  const excluded = new Set(['name', 'type', 'server', 'port', 'section', ...positional]);
  const parts = [String(value.type)];

  if (definition.endpoint !== false) {
    parts.push(String(value.server), String(value.port));
  }

  parts.push(...positional.filter((key) => Object.hasOwn(value, key)).map((key) => String(value[key])));
  parts.push(
    ...Object.entries(value)
      .filter(([key]) => !excluded.has(key))
      .map(([key, entry]) => `${key}=${String(entry)}`),
  );
  const name = String(value.name);
  const label = name.includes(',') && !name.startsWith('"') ? `"${name}"` : name;
  const sections = isRecord(value.section)
    ? [{ name: `WireGuard ${String(value['section-name'])}`, entries: value.section }]
    : [];

  return { content: `${label} = ${parts.join(separator)}`, sections };
}

export function defineNodes(definition: NodeModuleDefinition): NodeModule {
  return {
    ...definition,
    compileNodes(nodes, options) {
      const compiled: CompiledNode[] = [];

      nodes?.forEach((node, index) => {
        const resolved = transformNode(node, definition, { index, options });

        if (!resolved) {
          return;
        }

        const { value } = resolved;

        if (!validate(resolved.source, definition.type)) {
          return;
        }

        const output = definition.serialize(value, resolved.definition);

        if (output) {
          compiled.push({
            target: definition.type,
            value,
            ...output,
            ...(definition.type === 'singbox' ? { collection: resolved.definition.collection ?? 'outbounds' } : {}),
          });
        }
      });

      return compiled;
    },
  };
}

export function defineProvider<T extends NodeModule & Partial<TemplateModule> & Partial<Pick<NodeProvider, 'compile'>>>(
  definition: T,
): T & Pick<NodeProvider, 'compile'> {
  const provider: T & Pick<NodeProvider, 'compile'> = {
    ...definition,
    compile(input) {
      if (definition.compile) {
        return definition.compile(input);
      }

      const nodes = definition.compileNodes(input.nodes, input.options);

      return {
        target: provider.type,
        nodes,
        content:
          input.template === undefined || !definition.compileTemplate
            ? assemble(provider.type, nodes)
            : definition.compileTemplate(input.template, nodes),
      };
    },
  };

  return provider;
}
