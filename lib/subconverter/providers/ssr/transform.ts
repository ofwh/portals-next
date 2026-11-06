import { ssrProxyNode } from './parser';
import { NODE_ERROR, rejectNode } from '../../proxy-node/errors';
import { expand, flatten, get, put } from '../../proxy-node/mapping';
import { createTransform } from '../../proxy-node/transform';
import type { SSRConfig, SSRNode } from '../../types/providers/ssr';
import type { Binding } from '../../types/proxy-node/mapping';
import { camelCase, object, text } from '../schema';

export const supports = ['ssr'] as const;
const bindings = [
  {
    path: 'remarks',
    field: 'name',
  },
  {
    path: 'server',
    field: 'server',
  },
  {
    path: 'serverPort',
    field: 'port',
    codec: 'port',
  },
  {
    path: 'method',
    field: 'cipher',
  },
  {
    path: 'password',
    field: 'password',
  },
  {
    path: 'plugin',
    field: 'plugin',
  },
  {
    path: 'group',
    field: 'group',
  },
  {
    path: 'pluginOpts.mode',
    field: 'pluginMode',
  },
  {
    path: 'pluginOpts.host',
    field: 'pluginHost',
  },
  {
    path: 'pluginOpts.path',
    field: 'pluginPath',
  },
  {
    path: 'pluginOpts.tls',
    field: 'pluginTls',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.echOpts.enable',
    field: 'pluginEchOptsEnable',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.echOpts.config',
    field: 'pluginEchOptsConfig',
  },
  {
    path: 'pluginOpts.echOpts.queryServerName',
    field: 'pluginEchOptsQueryServerName',
  },
  {
    path: 'pluginOpts.fingerprint',
    field: 'pluginFingerprint',
  },
  {
    path: 'pluginOpts.certificate',
    field: 'pluginCertificate',
  },
  {
    path: 'pluginOpts.privateKey',
    field: 'pluginPrivateKey',
  },
  {
    path: 'pluginOpts.headers',
    field: 'pluginHeaders',
    codec: 'headersSingle',
  },
  {
    path: 'pluginOpts.skipCertVerify',
    field: 'pluginSkipCertVerify',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.nameCertVerify',
    field: 'pluginNameCertVerify',
  },
  {
    path: 'pluginOpts.mux',
    field: 'pluginMux',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.v2rayHttpUpgrade',
    field: 'pluginV2rayHttpUpgrade',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.v2rayHttpUpgradeFastOpen',
    field: 'pluginV2rayHttpUpgradeFastOpen',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.password',
    field: 'pluginPassword',
  },
  {
    path: 'pluginOpts.version',
    field: 'pluginVersion',
    codec: 'number',
  },
  {
    path: 'pluginOpts.alpn',
    field: 'pluginAlpn',
  },
  {
    path: 'pluginOpts.versionHint',
    field: 'pluginVersionHint',
  },
  {
    path: 'pluginOpts.restlsScript',
    field: 'pluginRestlsScript',
  },
  {
    path: 'pluginOpts.forceTls12',
    field: 'pluginForceTls12',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.username',
    field: 'pluginUsername',
  },
  {
    path: 'pluginOpts.key',
    field: 'pluginKey',
  },
  {
    path: 'pluginOpts.crypt',
    field: 'pluginCrypt',
  },
  {
    path: 'pluginOpts.conn',
    field: 'pluginConn',
    codec: 'number',
  },
  {
    path: 'pluginOpts.autoexpire',
    field: 'pluginAutoexpire',
    codec: 'number',
  },
  {
    path: 'pluginOpts.scavengettl',
    field: 'pluginScavengettl',
    codec: 'number',
  },
  {
    path: 'pluginOpts.mtu',
    field: 'pluginMtu',
    codec: 'number',
  },
  {
    path: 'pluginOpts.ratelimit',
    field: 'pluginRatelimit',
    codec: 'number',
  },
  {
    path: 'pluginOpts.sndwnd',
    field: 'pluginSndwnd',
    codec: 'number',
  },
  {
    path: 'pluginOpts.rcvwnd',
    field: 'pluginRcvwnd',
    codec: 'number',
  },
  {
    path: 'pluginOpts.datashard',
    field: 'pluginDatashard',
    codec: 'number',
  },
  {
    path: 'pluginOpts.parityshard',
    field: 'pluginParityshard',
    codec: 'number',
  },
  {
    path: 'pluginOpts.dscp',
    field: 'pluginDscp',
    codec: 'number',
  },
  {
    path: 'pluginOpts.nocomp',
    field: 'pluginNocomp',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.acknodelay',
    field: 'pluginAcknodelay',
    codec: 'boolean',
  },
  {
    path: 'pluginOpts.nodelay',
    field: 'pluginNodelay',
    codec: 'number',
  },
  {
    path: 'pluginOpts.interval',
    field: 'pluginInterval',
    codec: 'number',
  },
  {
    path: 'pluginOpts.resend',
    field: 'pluginResend',
    codec: 'number',
  },
  {
    path: 'pluginOpts.nc',
    field: 'pluginNc',
    codec: 'number',
  },
  {
    path: 'pluginOpts.sockbuf',
    field: 'pluginSockbuf',
    codec: 'number',
  },
  {
    path: 'pluginOpts.smuxver',
    field: 'pluginSmuxver',
    codec: 'number',
  },
  {
    path: 'pluginOpts.smuxbuf',
    field: 'pluginSmuxbuf',
    codec: 'number',
  },
  {
    path: 'pluginOpts.framesize',
    field: 'pluginFramesize',
    codec: 'number',
  },
  {
    path: 'pluginOpts.streambuf',
    field: 'pluginStreambuf',
    codec: 'number',
  },
  {
    path: 'pluginOpts.keepalive',
    field: 'pluginKeepalive',
    codec: 'number',
  },
  {
    path: 'protocol',
    field: 'protocol',
  },
  {
    path: 'protocolParam',
    field: 'protocolParam',
  },
  {
    path: 'protocolparam',
    field: 'protocolParam',
  },
  {
    path: 'obfs',
    field: 'obfs',
  },
  {
    path: 'obfsParam',
    field: 'obfsParam',
  },
  {
    path: 'obfsparam',
    field: 'obfsParam',
  },
] as const satisfies readonly Binding[];

function pluginInput(node: object): object {
  const source = { ...node };
  const value = get(source, 'pluginOpts');

  if (value !== undefined) {
    const options = {};

    for (const part of text(value).split(';').filter(Boolean)) {
      const equal = part.indexOf('=');
      const key = camelCase(equal < 0 ? part : part.slice(0, equal));

      if (get(options, key) !== undefined) {
        rejectNode(NODE_ERROR.DUPLICATE_PLUGIN_PARAMETER);
      }

      put(options, key, equal < 0 ? 'true' : part.slice(equal + 1));
    }
    put(source, 'pluginOpts', options);
  }

  return source;
}

function pluginOutput(node: object): object {
  const result = { ...node };
  const options = get(result, 'pluginOpts');

  if (options !== undefined) {
    const parts = Object.entries(object(options)).map(([key, value]) => {
      if (typeof value === 'object') {
        return rejectNode(NODE_ERROR.UNREPRESENTABLE_PLUGIN_PARAMETER);
      }

      return `${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}=${String(value)}`;
    });

    put(result, 'pluginOpts', parts.join(';'));
  }

  return result;
}

export function extract(config: SSRConfig): SSRNode[] {
  if ('configs' in config) {
    return config.configs;
  }

  return [
    {
      server: config.server,
      serverPort: config.serverPort,
      method: config.method,
      password: config.password,
      protocol: config.protocol,
      protocolparam: config.protocolparam,
      protocolParam: config.protocolParam,
      obfs: config.obfs,
      obfsparam: config.obfsparam,
      obfsParam: config.obfsParam,
      remarks: config.remarks,
      group: config.group,
      plugin: config.plugin,
      pluginOpts: config.pluginOpts,
    },
  ];
}

export const transform = createTransform({
  provider: 'ssr',
  supports,
  readNode: ssrProxyNode,
  toFields(node) {
    const source = pluginInput(node);

    return flatten('ssr', source, bindings, [], { protocol: node.protocol ?? 'origin', obfs: node.obfs ?? 'plain' });
  },
  toNode(fields): SSRNode {
    return ssrProxyNode(pluginOutput(expand(fields, bindings)));
  },
});
