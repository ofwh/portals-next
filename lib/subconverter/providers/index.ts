import { Base64Provider } from './base64';
import { ClashProvider } from './clash';
import { LinksProvider } from './links';
import { LoonProvider } from './loon';
import { SingBoxProvider } from './sing-box';

export { Base64Provider, ClashProvider, LinksProvider, LoonProvider, SingBoxProvider };
export { ConfigProvider } from './provider';
export type { ProviderConfig, ProviderStringOptions } from './provider';
export const providers = {
  base64: Base64Provider,
  clash: ClashProvider,
  links: LinksProvider,
  loon: LoonProvider,
  'sing-box': SingBoxProvider,
};
