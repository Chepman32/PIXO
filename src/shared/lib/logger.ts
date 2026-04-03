export const logger = {
  info: (...args: unknown[]) => {
    if (__DEV__) {
      console.log('[Squoze]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn('[Squoze]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error('[Squoze]', ...args);
  },
};
