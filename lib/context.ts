import 'server-only';
import { DEFAULT_SHORTCUTS } from '@/lib/constants/shortcuts';
import type { AppContext, ApplicationConfig } from '@/lib/types/route';

const globalForContext = globalThis as typeof globalThis & { portalsContext?: AppContext };

function createContext(): AppContext {
  const shortcuts = Object.fromEntries(
    Object.entries(DEFAULT_SHORTCUTS).map(([type, value]) => [type, Object.freeze({ ...value })]),
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
