import { createClient, RESP_TYPES } from 'redis';
import 'server-only';
import type { RedisSetOptions } from '@/lib/types/route';

let client: ReturnType<typeof createClient> | undefined;
let connecting: Promise<void> | undefined;

async function connect() {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error('REDIS_URL is required');
  }

  if (!client) {
    client = createClient({
      url,
      disableOfflineQueue: true,
      socket: { connectTimeout: 2000, reconnectStrategy: false },
    });
    client.on('error', () => undefined);
  }

  if (!client.isReady) {
    connecting ??= client
      .connect()
      .then(() => undefined)
      .finally(() => {
        connecting = undefined;
      });
    await connecting;
  }

  return client.withCommandOptions({ timeout: 2000 }).withTypeMapping({ [RESP_TYPES.BLOB_STRING]: Buffer });
}

export async function get(key: string): Promise<Uint8Array | null> {
  const connection = await connect();

  return connection.get(key);
}

export async function set(key: string, value: Uint8Array, options: RedisSetOptions = {}): Promise<void> {
  const connection = await connect();
  const ttl = options.ttlSeconds;

  if (ttl !== undefined && (!Number.isSafeInteger(ttl) || ttl <= 0)) {
    throw new Error('Invalid Redis expiry');
  }

  await connection.set(key, Buffer.from(value), ttl === undefined ? {} : { expiration: { type: 'EX', value: ttl } });
}

export async function remove(key: string): Promise<void> {
  const connection = await connect();

  await connection.del(key);
}

export async function close(): Promise<void> {
  await connecting?.catch(() => undefined);

  if (client?.isOpen) {
    client.destroy();
  }

  client = undefined;
}

const service = { get, set, remove, close };

export default service;
