const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const { requireAuth, requireAdmin } = require('./middleware');

const VIEWS = path.join(__dirname, '..', 'views');
const ALLOWED_ROLES = ['admin', 'client'];

module.exports = function authRoutes(db) {
  const router = express.Router();

  // ── Login ──────────────────────────────────────────────────────────────────
  router.get('/login', (req, res) => {
    res.sendFile(path.join(VIEWS, 'login.html'));
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).send('Invalid email or password.');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password.');
    }
    req.session.regenerate((err) => {
      if (err) return res.status(500).send('Session error');
      req.session.userId = user.id;
      req.session.role = user.role;
      res.redirect('/dashboard');
    });
  });

  // ── Logout ─────────────────────────────────────────────────────────────────
  router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
  });

  // ── Dashboard ──────────────────────────────────────────────────────────────
  router.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(VIEWS, 'dashboard.html'));
  });

  // ── Admin: generate invite ─────────────────────────────────────────────────
  router.get('/admin/invite', requireAdmin, (req, res) => {
    const { email, role } = req.query;
    if (!email) return res.status(400).json({ error: 'email is required' });
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: 'role must be admin or client' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const expires = now + 48 * 60 * 60 * 1000;
    db.prepare(
      'INSERT INTO invites (token, email, role, used, expires_at, created_at) VALUES (?, ?, ?, 0, ?, ?)'
    ).run(token, email, role, expires, now);
    const inviteUrl = `/invite/${token}`;
    res.json({ inviteUrl });
  });

  // ── Invite: accept ─────────────────────────────────────────────────────────
  router.get('/invite/:token', (req, res) => {
    const invite = db.prepare(
      'SELECT * FROM invites WHERE token = ? AND used = 0 AND expires_at > ?'
    ).get(req.params.token, Date.now());
    if (!invite) return res.status(400).send('Invalid or expired invite link.');
    res.sendFile(path.join(VIEWS, 'set-password.html'));
  });

  router.post('/invite/:token', async (req, res) => {
    // First check if the token exists at all (regardless of used/expired)
    const anyInvite = db.prepare(
      'SELECT * FROM invites WHERE token = ?'
    ).get(req.params.token);

    // Unknown token → 404
    if (!anyInvite) return res.status(404).send('Invite not found.');

    // Token exists but is used or expired → 400
    if (anyInvite.used || anyInvite.expires_at <= Date.now()) {
      return res.status(400).send('Invalid or expired invite link.');
    }

    const invite = anyInvite;
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).send('Password must be at least 8 characters.');
    }

    const hash = await bcrypt.hash(password, 12);
    const now = Date.now();

    const acceptInvite = db.transaction(() => {
      db.prepare(
        'INSERT INTO users (email, password, role, created_at) VALUES (?, ?, ?, ?)'
      ).run(invite.email, hash, invite.role, now);
      db.prepare('UPDATE invites SET used = 1 WHERE token = ?').run(invite.token);
    });

    try {
      acceptInvite();
    } catch (e) {
      // email already exists (unique constraint) — treat as already accepted
      return res.status(400).send('This invite has already been used.');
    }

    res.redirect('/login');
  });

  return router;
};
