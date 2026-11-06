import type { NativeObject, OutputContext, OutputParts } from '../../types/output';
import { templateDocument } from '../shared/template';

export function combine(parts: OutputParts<NativeObject, never[], never[]>, context: OutputContext): NativeObject[] {
  const base = templateDocument(context.template, 'sssub') ?? {};

  return parts.nodes.entries.map((entry) => ({
    ...base,
    ...entry.value,
    remarks: entry.value.remarks,
    server: entry.value.server,
    server_port: entry.value.server_port,
    method: entry.value.method,
    password: entry.value.password,
    plugin: entry.value.plugin ?? '',
    plugin_opts: entry.value.plugin_opts ?? '',
  }));
}
