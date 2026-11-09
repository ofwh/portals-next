import { Buffer } from 'node:buffer';
import { isIP } from 'node:net';
import type { ProxyNode } from '../../types/proxy-node';
import type { IniDocument, IniEntry, TemplateValue } from '../../types/template';
import { CompileError, warn } from '../diagnostics';
import type { CompileContext, EncodedNode, TargetObject } from '../types';

export function object(value: TemplateValue | undefined): value is TargetObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function put(target: TargetObject, key: string, value: TemplateValue | undefined): void {
  if (value !== undefined) {
    target[key] = value;
  }
}

export function nonempty(target: TargetObject, key: string, value: string | undefined): void {
  if (value) {
    target[key] = value;
  }
}

export function base64(value: string, url = false): string {
  return Buffer.from(value).toString(url ? 'base64url' : 'base64');
}

export function host(server: string): string {
  return isIP(server) === 6 ? `[${server}]` : server;
}

export function pluginOptions(node: ProxyNode): Record<string, string> {
  return Object.fromEntries(
    (node.pluginOptions ?? []).map((entry) => {
      const index = entry.indexOf('=');

      return index < 0 ? [entry, ''] : [entry.slice(0, index), entry.slice(index + 1)];
    }),
  );
}

export function encodeNodes<T>(
  context: CompileContext,
  encode: (node: ProxyNode, index: number) => T | undefined,
  quote = false,
): EncodedNode<T>[] {
  const used = new Set<string>();
  const output: EncodedNode<T>[] = [];

  for (const [index, input] of context.nodes.entries()) {
    const node = { ...input, name: input.name.replaceAll('=', '-') };

    if (quote && node.name.includes(',')) {
      node.name = `"${node.name}"`;
    }

    const original = node.name;
    let suffix = 2;

    while (used.has(node.name)) {
      node.name = `${original} ${suffix++}`;
    }
    const value = context.protocols.includes(node.protocol) ? encode(node, index) : undefined;

    if (value === undefined) {
      warn(context, 'UNSUPPORTED_NODE', 'nodes', index);
      continue;
    }

    used.add(node.name);
    output.push({ node, value });
  }

  return output;
}

export function entries(document: IniDocument, name: string): IniEntry[] {
  return document.sections.filter((section) => section.name === name).flatMap((section) => section.entries);
}

export function writeSection(document: IniDocument, name: string, lines: string[], replace = false): void {
  const sections = document.sections.filter((section) => section.name === name);
  let section = sections[0];

  if (!section) {
    section = { name, entries: [] };
    document.sections.push(section);
  }

  if (replace) {
    for (const item of sections) {
      item.entries = [];
    }
  }

  section.entries.push(...lines.map((value) => ({ key: null, value })));
}

export function iniLine(entry: IniEntry): string {
  return entry.key === null ? entry.value : `${entry.key} = ${entry.value}`;
}

export function serializeIni(document: IniDocument): string {
  return document.sections
    .map(
      (section) => `${section.name === null ? '' : `[${section.name}]\n`}${section.entries.map(iniLine).join('\n')}\n`,
    )
    .join('\n');
}

export function templateObject(context: CompileContext, format: 'yaml' | 'json'): TargetObject {
  const template = context.template;

  if (!template || template.format !== format || !object(template.value)) {
    throw new CompileError('INVALID_TEMPLATE', 'template');
  }

  return template.value;
}

export function templateIni(context: CompileContext): IniDocument {
  if (!context.template || context.template.format !== 'ini') {
    throw new CompileError('INVALID_TEMPLATE', 'template');
  }

  return context.template.value;
}

export function duration(seconds: number): string {
  return `${seconds >= 3600 ? `${Math.floor(seconds / 3600)}h` : ''}${seconds % 3600 >= 60 ? `${Math.floor((seconds % 3600) / 60)}m` : ''}${seconds % 60 ? `${seconds % 60}s` : ''}`;
}

export function mbps(value: string | undefined): number | undefined {
  if (value === undefined) {
    return;
  }

  const text = value
    .trim()
    .replace(/(?: Mbps|Mbps)$/, '')
    .trim();

  return /^\d+$/.test(text) && Number(text) <= 2147483647 ? Number(text) : undefined;
}
