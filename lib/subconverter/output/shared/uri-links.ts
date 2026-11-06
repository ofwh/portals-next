import logger from '@/lib/api/logger';
import { fail, OUTPUT_ERROR } from './errors';
import type { UriNode } from '../../types/providers/uri';

const nativeNames: Readonly<Record<string, string>> = {
  obfsPassword: 'obfs-password',
  hopInterval: 'hop-interval',
  pinSha256: 'pinSHA256',
  idleSessionCheckInterval: 'idle_session_check_interval',
  idleSessionTimeout: 'idle_session_timeout',
  minIdleSession: 'min_idle_session',
};

function host(server: string): string {
  return server.includes(':') && !server.startsWith('[') ? `[${server}]` : server;
}

export function name(node: UriNode): string | undefined {
  if (!('config' in node)) {
    return node.name;
  }

  if (node.scheme === 'ssr') {
    return node.config.remarks;
  }

  return 'arguments' in node.config ? node.config.name : node.config.ps;
}

export function stringify(node: UriNode, index: number): string {
  if ('config' in node) {
    if (node.scheme !== 'ssr') {
      if ('arguments' in node.config) {
        logger.warn(OUTPUT_ERROR.UNSUPPORTED_NODE_OR_DEPENDENCY, { data: node, field: 'config' });

        return fail('node', index, 'config', OUTPUT_ERROR.UNSUPPORTED_NODE_OR_DEPENDENCY);
      }

      return `vmess://${Buffer.from(JSON.stringify(node.config), 'utf8').toString('base64')}`;
    }

    const config = node.config;

    if (config.plugin || config.pluginOpts) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_NODE_OR_DEPENDENCY, { data: node, field: 'plugin' });

      return fail('node', index, 'plugin', OUTPUT_ERROR.UNSUPPORTED_NODE_OR_DEPENDENCY);
    }

    const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
    const options = [
      ['group', config.group],
      ['remarks', config.remarks],
      ['obfsparam', config.obfsParam ?? config.obfsparam],
      ['protoparam', config.protocolParam ?? config.protocolparam],
    ].flatMap(([key, value]) => (value === undefined ? [] : [`${key}=${encode(value)}`]));
    const payload = `${host(config.server)}:${config.serverPort}:${config.protocol ?? 'origin'}:${config.method}:${config.obfs ?? 'plain'}:${encode(config.password)}/?${options.join('&')}`;

    return `ssr://${encode(payload)}`;
  }

  let credentials =
    node.username || node.password
      ? `${encodeURIComponent(node.username)}${node.password ? `:${encodeURIComponent(node.password)}` : ''}`
      : '';

  if (node.scheme === 'ss' && !node.username.startsWith('2022-')) {
    credentials = Buffer.from(`${node.username}:${node.password}`, 'utf8').toString('base64url');
  }

  const parameters: [string, string][] = [];
  let allowInsecure: string | undefined;

  for (const [key, value] of node.query) {
    if (key === 'insecure' || key === 'allowInsecure') {
      const normalized = value === 'true' || value === '1' ? '1' : '0';

      if (node.scheme === 'trojan') {
        allowInsecure ??= normalized;
      } else {
        parameters.push([key, normalized]);
      }

      continue;
    }

    parameters.push([nativeNames[key] ?? key, value]);
  }

  if (allowInsecure !== undefined) {
    parameters.push(['allowInsecure', allowInsecure]);
  }

  const query = parameters.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  const port = node.ports ?? node.port;
  const path = node.path || (query ? '/' : '');

  return `${node.scheme}://${credentials ? `${credentials}@` : ''}${host(node.server)}${port === undefined ? '' : `:${port}`}${path}${query ? `?${query}` : ''}${node.name ? `#${encodeURIComponent(node.name)}` : ''}`;
}
