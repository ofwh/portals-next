import 'server-only';
import baseLogger from '@/lib/logger';
import { getRequestId } from './request-context';

const logger = new Proxy(baseLogger, {
  get(target, property) {
    const value: unknown = Reflect.get(target, property, target);

    if (typeof value !== 'function') {
      return value;
    }

    return (...args: unknown[]) => {
      const requestId = getRequestId();
      const scopedLogger = requestId ? target.child({ requestId }) : target;

      return Reflect.apply(value, scopedLogger, args);
    };
  },
});

export { logger };
export default logger;
