import 'server-only';
import { DEFAULT_SHORTCUTS } from '@/lib/constants/shortcuts';
import { setAppConfig } from '@/lib/context';
import shortcuts from '@/lib/repositories/shortcuts';
import type { ApplicationConfig, ShortcutSettings } from '@/lib/types/route';
import type { ShortcutType } from '@/lib/types/shortcuts';

export function refresh(): ApplicationConfig {
  const configured: Record<ShortcutType, ShortcutSettings> = { ...DEFAULT_SHORTCUTS };
  const types = Object.keys(DEFAULT_SHORTCUTS) as ShortcutType[];

  for (const type of types) {
    const stored = shortcuts.findByType(type);

    configured[type] = Object.freeze({
      pathname: stored?.pathname ?? DEFAULT_SHORTCUTS[type].pathname,
      status: stored?.status ?? DEFAULT_SHORTCUTS[type].status,
    });
  }

  const config = Object.freeze({ shortcuts: Object.freeze(configured) });

  setAppConfig(config);

  return config;
}

const config = { refresh };

export default config;
