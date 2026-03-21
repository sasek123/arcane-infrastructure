const request = require('supertest');
const Database = require('better-sqlite3');
const { initDb } = require('../db');
const bcrypt = require('bcrypt');

// Build a test app with in-memory DB
function buildApp(db) {
  const express = require('express');
  const session = require('express-session');
  const authRoutes = require('../auth/routes');

  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  app.use('/', authRoutes(db));
  return app;
}

let db;
let app;

beforeEach(() => {
  db = new Database(':memory:');
  initDb(db);
  app = buildApp(db);
});

afterEach(() => {
  db.close();
});

// ── Login ────────────────────────────────────────────────────────────────────

describe('POST /login', () => {
  beforeEach(async () => {
    const hash = await bcrypt.hash('password123', 12);
    db.prepare('INSERT INTO users (email, password, role, created_at) VALUES (?, ?, ?, ?)')
      .run('user@test.com', hash, 'client', Date.now());
  });

  test('redirects to /dashboard on valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send('email=user@test.com&password=password123');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
  });

  test('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send('email=user@test.com&password=wrongpassword');
    expect(res.status).toBe(401);
  });

  test('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/login')
      .send('email=nobody@test.com&password=password123');
    expect(res.status).toBe(401);
  });
});

// ── Logout ───────────────────────────────────────────────────────────────────

describe('GET /logout', () => {
  test('redirects to /login', async () => {
    const res = await request(app).get('/logout');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});

// ── Invite generation ────────────────────────────────────────────────────────

describe('GET /admin/invite', () => {
  beforeEach(async () => {
    const hash = await bcrypt.hash('adminpass', 12);
    db.prepare('INSERT INTO users (email, password, role, created_at) VALUES (?, ?, ?, ?)')
      .run('admin@test.com', hash, 'admin', Date.now());
  });

  test('returns 401 when not logged in', async () => {
    const res = await request(app)
      .get('/admin/invite?email=x@test.com&role=client');
    // unauthenticated → redirect to /login
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('returns 400 for invalid role', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send('email=admin@test.com&password=adminpass');
    const res = await agent.get('/admin/invite?email=x@test.com&role=superuser');
    expect(res.status).toBe(400);
  });

  test('returns invite URL for valid request', async () => {
    const agent = request.agent(app);
    await agent.post('/login').send('email=admin@test.com&password=adminpass');
    const res = await agent.get('/admin/invite?email=x@test.com&role=client');
    expect(res.status).toBe(200);
    expect(res.body.inviteUrl).toMatch(/\/invite\/[a-f0-9]{64}/);
  });
});

// ── Invite acceptance ────────────────────────────────────────────────────────

describe('POST /invite/:token', () => {
  let token;

  beforeEach(() => {
    token = 'a'.repeat(64);
    db.prepare('INSERT INTO invites (token, email, role, used, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(token, 'newuser@test.com', 'client', 0, Date.now() + 48 * 60 * 60 * 1000, Date.now());
  });

  test('creates user and redirects to /login', async () => {
    const res = await request(app)
      .post(`/invite/${token}`)
      .send('password=newpassword123');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get('newuser@test.com');
    expect(user).toBeDefined();
    expect(user.role).toBe('client');
  });

  test('marks invite as used after acceptance', async () => {
    await request(app).post(`/invite/${token}`).send('password=newpassword123');
    const invite = db.prepare('SELECT * FROM invites WHERE token = ?').get(token);
    expect(invite.used).toBe(1);
  });

  test('returns 400 for already-used token', async () => {
    await request(app).post(`/invite/${token}`).send('password=first');
    const res = await request(app).post(`/invite/${token}`).send('password=second');
    expect(res.status).toBe(400);
  });

  test('returns 400 for expired token', async () => {
    db.prepare('UPDATE invites SET expires_at = ? WHERE token = ?')
      .run(Date.now() - 1000, token);
    const res = await request(app).post(`/invite/${token}`).send('password=newpassword123');
    expect(res.status).toBe(400);
  });

  test('returns 404 for unknown token', async () => {
    const res = await request(app).post('/invite/unknowntoken').send('password=x');
    expect(res.status).toBe(404);
  });
});
