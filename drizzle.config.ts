import { loadEnvConfig } from '@next/env';
import { defineConfig } from 'drizzle-kit';
import { getDatabasePath } from './lib/db/config';

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production');

export default defineConfig({
  dialect: 'sqlite',
  schema: './lib/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    url: getDatabasePath(),
  },
});
