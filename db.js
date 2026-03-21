const Database = require('better-sqlite3');
const path = require('path');

function initDb(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invites (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      token      TEXT UNIQUE NOT NULL,
      email      TEXT NOT NULL,
      role       TEXT NOT NULL,
      used       INTEGER DEFAULT 0,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid     TEXT PRIMARY KEY,
      sess    TEXT NOT NULL,
      expired INTEGER NOT NULL
    );
  `);
}

let db;
try {
  db = new Database(path.join(__dirname, 'arcane.db'));
  initDb(db);
} catch (error) {
  console.error('Failed to initialize database:', error.message);
  process.exit(1);
}

module.exports = { db, initDb };
