import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';

const app = express();

app.use(express.json());

// === SQLite initialization ===
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    password TEXT NOT NULL,
    cordinate TEXT
  );
`);

// Seed 10 random users if table is empty
const countRow = db.prepare('SELECT COUNT(1) as count FROM users').get() as { count: number };
if (countRow.count === 0) {
  const insert = db.prepare(
    'INSERT INTO users (user_name, password, cordinate) VALUES (?, ?, ?)'
  );
  const insertMany = db.transaction((rows: Array<{ user_name: string; password: string; cordinate: string }>) => {
    for (const row of rows) {
      insert.run(row.user_name, row.password, row.cordinate);
    }
  });

  const randomUsers: Array<{ user_name: string; password: string; cordinate: string }> = [];
  for (let i = 0; i < 10; i += 1) {
    const nameSuffix = crypto.randomBytes(3).toString('hex');
    const password = crypto.randomBytes(9).toString('base64url');
    const lat = (Math.random() * 180 - 90).toFixed(6);
    const lon = (Math.random() * 360 - 180).toFixed(6);
    randomUsers.push({
      user_name: `user_${nameSuffix}`,
      password,
      cordinate: `${lat},${lon}`,
    });
  }

  insertMany(randomUsers);
  console.log('[db] Seeded 10 users');
}

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

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

