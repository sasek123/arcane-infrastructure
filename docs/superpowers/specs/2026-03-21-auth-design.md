# Auth System Design
**Date:** 2026-03-21
**Project:** Arcane Infrastructure
**Status:** Approved

---

## Overview

A simple, session-based authentication system for the Arcane Infrastructure web app. Supports two roles (admin, client) with invite-only account creation. No self-registration. Built with Node.js, Express, SQLite, and `express-session`.

---

## Goals

- Get users behind a login wall quickly
- Support admin and client roles
- Invite-only account creation (admin generates token link, shares manually)
- Placeholder protected dashboard after login
- Leave `landing.html` completely untouched

---

## Non-Goals (for now)

- Email sending (invite links are generated and shared manually)
- OAuth / social login
- Password reset flow
- Role-specific dashboard content
- Multi-server / distributed session support

---

## Tech Stack

| Concern | Library |
|---|---|
| Server | `express` |
| Database | `better-sqlite3` |
| Sessions | `express-session` + SQLite session store (`better-sqlite3-session-store`) |
| Password hashing | `bcrypt` |
| Env config | `dotenv` |

---

## File Structure

```
Arcane-Infra/
├── landing.html                  # untouched — partner's work
├── server.js                     # Express app entry point
├── db.js                         # SQLite connection + schema init
├── auth/
│   ├── routes.js                 # All auth route handlers
│   └── middleware.js             # requireAuth, requireAdmin guards
├── views/
│   ├── login.html                # Arcane-branded login page
│   ├── set-password.html         # Invite acceptance / password setup
│   └── dashboard.html           # Protected placeholder dashboard
├── package.json
└── .env                          # SESSION_SECRET, PORT
```

---

## Database Schema

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,        -- bcrypt hash
  role       TEXT NOT NULL,        -- 'admin' | 'client'
  created_at INTEGER NOT NULL      -- unix timestamp
);

-- Invite tokens table
CREATE TABLE IF NOT EXISTS invites (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT UNIQUE NOT NULL, -- random 32-byte hex string
  email      TEXT NOT NULL,        -- intended recipient email
  role       TEXT NOT NULL,        -- role granted on acceptance
  used       INTEGER DEFAULT 0,    -- 0 = unused, 1 = used
  expires_at INTEGER NOT NULL,     -- unix timestamp (48h from creation)
  created_at INTEGER NOT NULL
);

-- Sessions table (managed by express-session store)
CREATE TABLE IF NOT EXISTS sessions (
  sid     TEXT PRIMARY KEY,
  sess    TEXT NOT NULL,
  expired INTEGER NOT NULL
);
```

---

## Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Serves `landing.html` |
| GET | `/login` | Public | Serves `login.html` |
| POST | `/login` | Public | Validates credentials, creates session, redirects to `/dashboard` |
| GET | `/logout` | Auth | Destroys session, redirects to `/login` |
| GET | `/dashboard` | Auth | Serves `dashboard.html` placeholder |
| GET | `/invite/:token` | Public | Validates token, serves `set-password.html` |
| POST | `/invite/:token` | Public | Creates user, marks token used, redirects to `/login` |
| GET | `/admin/invite` | Admin | Generates and returns a one-time invite link |

---

## Auth Middleware

**`requireAuth`**
Checks `req.session.userId` exists. If not, redirects to `/login`. Applied to `/dashboard` and any future protected routes.

**`requireAdmin`**
Checks `req.session.role === 'admin'`. If not, returns 403. Applied to `/admin/invite`.

---

## Invite Flow

1. Admin calls `GET /admin/invite?email=x@y.com&role=client`
2. Server generates a 32-byte random hex token, stores it in `invites` with a 48h expiry
3. Server returns the full invite URL: `/invite/<token>`
4. Admin copies and shares the URL manually (Slack, email, etc.)
5. Client opens the URL → server validates token (exists, unused, not expired) → serves `set-password.html`
6. Client submits password → server hashes it, creates user row, marks invite as used
7. Client redirected to `/login`

---

## Login Flow

1. Client submits email + password to `POST /login`
2. Server looks up user by email, runs `bcrypt.compare`
3. On success: sets `req.session.userId` and `req.session.role`, redirects to `/dashboard`
4. On failure: re-renders login page with a generic error ("Invalid email or password")

---

## Security Notes

- Passwords stored as bcrypt hashes (cost factor 12)
- Sessions use a secret from `.env` (`SESSION_SECRET`)
- `httpOnly: true`, `sameSite: 'strict'` on session cookie
- Invite tokens are single-use and expire after 48 hours
- Login errors are intentionally generic (no user enumeration)
- `.env` must be in `.gitignore`
