import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { User } from './types.js';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    cordinate TEXT,
    access_token TEXT,
    refresh_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Ensure required columns exist for existing databases created before tokens were added
(() => {
  try {
    const existingColumns = db.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
    const columnNames = new Set(existingColumns.map(c => c.name));

    const alterStatements: string[] = [];
    if (!columnNames.has('access_token')) {
      alterStatements.push('ALTER TABLE users ADD COLUMN access_token TEXT');
    }
    if (!columnNames.has('refresh_token')) {
      alterStatements.push('ALTER TABLE users ADD COLUMN refresh_token TEXT');
    }

    if (alterStatements.length > 0) {
      db.exec(alterStatements.join(';') + ';');
      console.log('[db] Added missing columns to users:', alterStatements.map(s => s.split(' ').at(-2)).join(', '));
    }
  } catch (error) {
    console.error('[db] Error ensuring users columns exist', error);
  }
})();

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
    const plainPassword = crypto.randomBytes(9).toString('base64url');
    const hashedPassword = bcrypt.hashSync(plainPassword, 10);
    const lat = (Math.random() * 180 - 90).toFixed(6);
    const lon = (Math.random() * 360 - 180).toFixed(6);
    randomUsers.push({
      user_name: `user_${nameSuffix}`,
      password: hashedPassword,
      cordinate: `${lat},${lon}`,
    });
  }

  insertMany(randomUsers);
  console.log('[db] Seeded 10 users with hashed passwords');
}

export const getUserByUsername = db.prepare('SELECT * FROM users WHERE user_name = ?');
export const getUserById = db.prepare('SELECT * FROM users WHERE id = ?');
export const updateUserTokens = db.prepare('UPDATE users SET access_token = ?, refresh_token = ? WHERE id = ?');
export const clearUserTokensById = db.prepare('UPDATE users SET access_token = NULL, refresh_token = NULL WHERE id = ?');
export const getUserByRefreshToken = db.prepare('SELECT * FROM users WHERE refresh_token = ?');


