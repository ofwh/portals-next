import 'server-only';
import { config, createLogger, format, transports } from 'winston';

function createAppLogger() {
  const configuredLevel = process.env.LOG_LEVEL?.trim().toLowerCase();
  const level =
    configuredLevel && Object.prototype.hasOwnProperty.call(config.npm.levels, configuredLevel)
      ? configuredLevel
      : 'info';

  return createLogger({
    level,
    format: format.combine(format.errors({ stack: false }), format.splat(), format.timestamp(), format.json()),
    transports: [new transports.Console({ stderrLevels: ['error'] })],
  });
}

const globalForLogger = globalThis as typeof globalThis & {
  portalsLogger?: ReturnType<typeof createAppLogger>;
};

export const logger = globalForLogger.portalsLogger ?? createAppLogger();

if (process.env.NODE_ENV !== 'production') {
  globalForLogger.portalsLogger = logger;
}

export default logger;
