/**
 * Structured logger.
 *
 * `console.log` is banned across the app (CLAUDE.md coding rule 10); every
 * diagnostic goes through here. Log messages are NOT user-facing, so they stay
 * in English and are never translated.
 *
 * Oxygen runs a Workers runtime, so this is deliberately a thin wrapper around
 * the platform console rather than a Node logging library.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

/**
 * Never log a token, a client secret or a raw ID token. Values whose key
 * matches one of these fragments are replaced before they reach the console.
 */
const REDACTED_KEY_FRAGMENTS = [
  'token',
  'secret',
  'password',
  'code_verifier',
  'codeverifier',
  'authorization',
  'cookie',
];

const REDACTED = '[redacted]';

function redact(context: LogContext): LogContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      const lowered = key.toLowerCase();
      const sensitive = REDACTED_KEY_FRAGMENTS.some((fragment) =>
        lowered.includes(fragment),
      );
      return [key, sensitive ? REDACTED : value];
    }),
  );
}

function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return {error: error.message, stack: error.stack};
  }
  if (error === undefined) return {};
  return {error: String(error)};
}

function emit(
  level: LogLevel,
  scope: string,
  message: string,
  context?: LogContext,
) {
  const payload = {
    level,
    scope,
    message,
    ...(context ? redact(context) : {}),
  };

  // eslint-disable-next-line no-console
  const write = level === 'debug' ? console.debug : console[level];
  write(JSON.stringify(payload));
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
}

/**
 * Create a logger bound to a scope, e.g. `createLogger('auth.callback')`.
 */
export function createLogger(scope: string): Logger {
  return {
    debug: (message, context) => emit('debug', scope, message, context),
    info: (message, context) => emit('info', scope, message, context),
    warn: (message, context) => emit('warn', scope, message, context),
    error: (message, error, context) =>
      emit('error', scope, message, {...serializeError(error), ...context}),
  };
}

export const logger = createLogger('app');
