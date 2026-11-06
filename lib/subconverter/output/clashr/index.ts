import logger from '@/lib/api/logger';
import type { OutputElements } from '../../types/output';
import { adapter as clash } from '../clash';
import { transform as transformNodes } from '../clash/nodes';
import { transform as transformPolicies } from '../clash/policies';
import { transform as transformRules } from '../clash/rules';
import { fail, OUTPUT_ERROR } from '../shared/errors';

const protocols = ['ss', 'ssr', 'vmess', 'trojan', 'http', 'https', 'socks5', 'snell'];
const fields = new Set([
  'type',
  'name',
  'id',
  'sourceId',
  'groupId',
  'group',
  'server',
  'port',
  'cipher',
  'password',
  'uuid',
  'alterId',
  'tls',
  'serverName',
  'allowInsecure',
  'udp',
  'tcpFastOpen',
  'network',
  'path',
  'headers',
  'plugin',
  'pluginMode',
  'pluginHost',
  'pluginPath',
  'pluginTls',
  'pluginSkipCertVerify',
  'snellVersion',
  'obfsHost',
  'protocol',
  'protocolParam',
  'obfs',
  'obfsParam',
  'username',
]);

export const adapter: typeof clash = {
  ...clash,
  target: 'clashr',
  nodes: {
    transform(nodes: OutputElements['nodes']) {
      nodes.forEach((node, index) => {
        if (
          !protocols.includes(node.type) ||
          Object.keys(node).some((key) => !fields.has(key)) ||
          ('network' in node && node.network !== undefined && !['tcp', 'ws', 'http'].includes(node.network))
        ) {
          logger.warn(OUTPUT_ERROR.UNSUPPORTED_CLASHR_NODE, { data: node, field: 'fields' });

          fail('node', index, 'fields', OUTPUT_ERROR.UNSUPPORTED_CLASHR_NODE);
        }
      });

      const result = transformNodes(nodes);

      return {
        ...result,
        entries: result.entries.map((entry) => {
          if (entry.fields.type !== 'ssr') {
            return entry;
          }

          const value = { ...entry.value };

          if (value['protocol-param'] !== undefined) {
            value.protocolparam = value['protocol-param'];
            delete value['protocol-param'];
          }

          if (value['obfs-param'] !== undefined) {
            value.obfsparam = value['obfs-param'];
            delete value['obfs-param'];
          }

          return { ...entry, value };
        }),
      };
    },
  },
  policies: {
    transform: (policies, nodes, context) =>
      transformPolicies(policies, nodes, context, ['select', 'url-test', 'fallback', 'load-balance', 'relay']),
  },
  rules: {
    transform: (rules, context) =>
      transformRules(rules, context, 'clashr', [
        'MATCH',
        'DOMAIN',
        'DOMAIN-SUFFIX',
        'DOMAIN-KEYWORD',
        'IP-CIDR',
        'IP-CIDR6',
        'SRC-IP-CIDR',
        'GEOIP',
        'DST-PORT',
        'SRC-PORT',
        'PROCESS-NAME',
      ]),
  },
};
