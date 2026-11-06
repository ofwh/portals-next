import type { NativeObject } from './output';
import type { IniSection } from './providers/ini';

export interface IniTemplateDocument {
  sections: IniSection[];
}

export interface SubscriptionTemplateDocuments {
  clash: NativeObject;
  surge: IniTemplateDocument;
  surfboard: IniTemplateDocument;
  quanx: IniTemplateDocument;
  loon: IniTemplateDocument;
  sssub: NativeObject;
  singbox: NativeObject;
  stash: NativeObject;
}

export type SubscriptionTemplateFormat = keyof SubscriptionTemplateDocuments;
export type SubscriptionTemplate<T extends SubscriptionTemplateFormat = SubscriptionTemplateFormat> = {
  [F in T]: { format: F; document: SubscriptionTemplateDocuments[F] };
}[T];
