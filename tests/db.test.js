const Database = require('better-sqlite3');
const { initDb } = require('../db');

describe('initDb', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  test('creates users table', () => {
    initDb(db);
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    expect(row).toBeDefined();
    expect(row.name).toBe('users');
  });

  test('creates invites table', () => {
    initDb(db);
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='invites'").get();
    expect(row).toBeDefined();
    expect(row.name).toBe('invites');
  });

  test('creates sessions table', () => {
    initDb(db);
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'").get();
    expect(row).toBeDefined();
    expect(row.name).toBe('sessions');
  });

  test('is idempotent — calling twice does not throw', () => {
    expect(() => {
      initDb(db);
      initDb(db);
    }).not.toThrow();
  });
});
