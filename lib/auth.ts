import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth/minimal';
import { username } from 'better-auth/plugins';
import { db } from '@/lib/db';

export const auth = betterAuth({
  telemetry: {
    enabled: false,
  },
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 3,
    maxPasswordLength: 24,
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
    },
  },
  plugins: [username()],
});
