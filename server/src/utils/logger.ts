/* Minimal timestamped, leveled logger. */
type Level = 'info' | 'warn' | 'error' | 'debug';

function emit(level: Level, msg: string): void {
  const line = `${new Date().toISOString()} [${level.toUpperCase()}] ${msg}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (m: string) => emit('info', m),
  warn: (m: string) => emit('warn', m),
  error: (m: string) => emit('error', m),
  debug: (m: string) => {
    if (process.env.NODE_ENV !== 'production') emit('debug', m);
  },
};
