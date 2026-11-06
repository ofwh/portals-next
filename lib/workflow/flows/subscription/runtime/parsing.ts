import 'server-only';
import { appError } from '@/lib/api';
import {
  Base64Provider,
  ClashProvider,
  IniProvider,
  LoonProvider,
  QuanXProvider,
  SingBoxProvider,
  SSProvider,
  SSRProvider,
  SurfboardProvider,
  SurgeProvider,
  UriProvider,
  V2RayProvider,
} from '@/lib/subconverter';
import type { Provider, ProxyNodeFields } from '@/lib/subconverter';
import type { SubscriptionFormat } from '@/lib/subconverter/types/subscription';
import { schema } from '../schema';

function read<C extends object, N, F extends ProxyNodeFields>(
  provider: Provider<C, N, F>,
  content: string,
): ProxyNodeFields[] {
  provider.load(content);
  const nodes: unknown = JSON.parse(JSON.stringify(provider.transform('fields', provider.nodes)));

  return schema.proxyNodes.parse(nodes);
}

const parsers = {
  clash: (content: string) => read(new ClashProvider(), content),
  'sing-box': (content: string) => read(new SingBoxProvider(), content),
  uri: (content: string) => read(new UriProvider(), content),
  base64: (content: string) => read(new Base64Provider(), content),
  ss: (content: string) => read(new SSProvider(), content),
  ssr: (content: string) => read(new SSRProvider(), content),
  v2ray: (content: string) => read(new V2RayProvider(), content),
  ini: (content: string) => read(new IniProvider(), content),
  surge: (content: string) => read(new SurgeProvider(), content),
  surfboard: (content: string) => read(new SurfboardProvider(), content),
  loon: (content: string) => read(new LoonProvider(), content),
  quanx: (content: string) => read(new QuanXProvider(), content),
} satisfies Record<SubscriptionFormat, (content: string) => ProxyNodeFields[]>;

export function parse(content: string, format: SubscriptionFormat): ProxyNodeFields[] {
  try {
    return parsers[format](content.replace(/^\uFEFF/, '').trim());
  } catch {
    const failure = appError('workflow.SUBSCRIPTION_PARSE_FAILED');

    throw failure;
  }
}

const service = { parse };

export default service;
