import { nanoid } from 'nanoid';
import 'server-only';
import type { ProxyNode } from '../types/proxy-node';

type Rule = { regex: RegExp; replacement: string };

export function rename(nodes: readonly ProxyNode[], rules: readonly Rule[], signal: AbortSignal): ProxyNode[] {
  signal.throwIfAborted();

  return nodes.map((node) => {
    signal.throwIfAborted();
    let name = node.name;

    for (const { regex, replacement } of rules) {
      regex.lastIndex = 0;
      name = name.replace(regex, replacement);
    }

    return { ...node, name: name.trim() ? name : nanoid() };
  });
}

const service = { rename };

export default service;
