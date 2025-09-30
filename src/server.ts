import { createApp } from './app.ts';

const app = createApp();

const port = Number(process.env["PORT"] ?? 3000);

const server = app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});

const shutdown = (signal: string) => {
  console.log(`[server] received ${signal}, shutting down...`);
  server.close(err => {
    if (err) {
      console.error('[server] error during shutdown', err);
      process.exit(1);
    }
    console.log('[server] closed. bye.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));


