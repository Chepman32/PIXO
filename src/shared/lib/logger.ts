export const logger = {
  info: (...args: unknown[]) => {
    if (__DEV__) {
      console.log('[PIXO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn('[PIXO]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error('[PIXO]', ...args);
  },
};
