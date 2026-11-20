export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getAppContext } = await import('./lib/context');

    getAppContext();

    try {
      const { default: config } = await import('./lib/services/config');

      config.refresh();
    } catch {
      console.warn('Application configuration could not be loaded; using default shortcuts.');
    }
  }
}
