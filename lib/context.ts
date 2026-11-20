import 'server-only';
import { DEFAULT_SHORTCUTS, SHORTCUT_ROUTES } from '@/lib/constants/shortcuts';
import type { AppContext, ApplicationConfig } from '@/lib/types/route';
import type { ShortcutType } from '@/lib/types/shortcuts';

const globalForContext = globalThis as typeof globalThis & { portalsContext?: AppContext };

function createContext(): AppContext {
  const shortcuts = Object.fromEntries(
    (Object.keys(SHORTCUT_ROUTES) as ShortcutType[]).map((type) => [
      type,
      Object.freeze({ ...DEFAULT_SHORTCUTS[type] }),
    ]),
  ) as ApplicationConfig['shortcuts'];

  return { config: Object.freeze({ shortcuts: Object.freeze(shortcuts) }) };
}

export function getAppContext(): Readonly<AppContext> {
  return (globalForContext.portalsContext ??= createContext());
}

export function setAppConfig(config: ApplicationConfig): void {
  const ctx = (globalForContext.portalsContext ??= createContext());

  ctx.config = config;
}
