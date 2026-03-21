require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { db } = require('./db');
const authRoutes = require('./auth/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Session store ─────────────────────────────────────────────────────────
const SQLiteStore = require('connect-sqlite3')(session);

// ── Middleware ────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  store: new SQLiteStore({ db: 'arcane.db', dir: __dirname }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// ── Routes ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.use('/', authRoutes(db));

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Arcane Infrastructure running on http://localhost:${PORT}`);
});
