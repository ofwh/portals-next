import { ProxyAgent } from 'undici';
import type { ForwardMode, Middleware } from '@/lib/types/route';

export function proxy<K extends ForwardMode>(): Middleware<K> {
  return async (context, next) => {
    if (!context.outbound) {
      throw new Error();
    }

    if (!context.config.proxy) {
      await next();

      return;
    }

    const url = new URL(context.config.proxy);

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error();
    }

    const agent = new ProxyAgent(url.toString());
    let transferred = false;

    context.outbound.dispatcher = agent;
    try {
      await next();

      const response = context.response;

      if (response?.body) {
        const reader = response.body.getReader();
        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            try {
              const chunk = await reader.read();

              if (chunk.done) {
                controller.close();
                void agent.close().catch(() => undefined);
              } else {
                controller.enqueue(chunk.value);
              }
            } catch (error) {
              controller.error(error);
              void agent.destroy().catch(() => undefined);
            }
          },
          async cancel(reason) {
            try {
              await reader.cancel(reason);
            } finally {
              await agent.destroy();
            }
          },
        });

        context.response = new Response(stream, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
        transferred = true;
      }
    } finally {
      if (!transferred) {
        await agent.destroy().catch(() => undefined);
      }
    }
  };
}
