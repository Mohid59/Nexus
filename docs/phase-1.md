# Phase 1 — Backend foundation + real authentication

**Status:** complete. Maps to Week 1 of the brief.

## What shipped

### Repo restructure
- Monorepo: existing frontend moved to `/client` (via `git mv`, history preserved), new backend in `/server`, brief + notes in `/docs`.
- Root `README.md` (run both halves), extended `.gitignore` (env files, uploads, build output).

### Backend (`/server`) — Node + Express + TypeScript (CommonJS)
- **Config:** zod-validated env on boot (`config/env.ts`); process exits with a clear message on bad config.
- **Database:** Mongoose connection with exponential-backoff retry + connection-event logging.
- **User model:** single collection with a `role` field (`entrepreneur` | `investor`), role-specific fields optional (filled in later via profile). Password hashed in a `pre('save')` bcrypt hook. `toJSON` strips `password`, `__v`, reset fields, `tokenVersion` and maps `_id` → `id`.
- **Auth:** `register`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`. Short-lived JWT access token + refresh token in an httpOnly cookie. Refresh rotation + `tokenVersion` revocation (logout/reset invalidate outstanding refresh tokens). Reset tokens are random + sha256-hashed at rest, 30-min expiry.
- **Users:** `GET/PATCH /users/me`, `GET /users/:id`, `GET /investors`, `GET /entrepreneurs` (pagination + escaped-regex search).
- **Middleware:** `requireAuth`, `requireRole`, zod `validate`, central error handler (maps duplicate-key→409, validation→422, JWT→401), `notFound`.
- **Hardening (early):** helmet, CORS whitelist (comma-separated origins), `express-mongo-sanitize`, rate limiting on auth routes.
- **Mailer:** nodemailer; dev falls back to an Ethereal test inbox and logs preview/reset URLs.
- **Swagger** served at `/api/docs` (spec expands in later phases).
- **Seed:** 7 demo accounts (4 entrepreneurs, 3 investors) mirroring the original mock data.

### Frontend integration (`/client`)
- `src/lib/api.ts`: single axios instance, `VITE_API_URL` base, request interceptor attaches the access token, response interceptor transparently refreshes once on 401 then retries (shared in-flight refresh).
- `AuthContext` rewritten from fully-mocked to real API calls. Stores only access token + minimal user; never a password.
- `ProtectedRoute` + `RoleRoute` guards; `App.tsx` now protects all authenticated areas and gates dashboards by role. Added the previously-unrouted `/forgot-password` + `/reset-password` pages.
- Fixed LoginPage demo buttons (password now matches the seed) and wired "Forgot your password?".

## Decisions / deviations
- **bcryptjs** instead of native `bcrypt` (no Windows build toolchain needed; same API).
- **Express 4.x** (Express 5 makes `req.query` read-only, breaking `express-mongo-sanitize`).
- **multer 2.x / nodemailer 8.x** — bumped from the brief's defaults to clear high-severity advisories (`npm audit` clean on the backend).
- Single-collection role model (not discriminators) — simpler to query for the mixed lists.

## Checkpoint (verified)
Anonymous load → `/login`; register (API, with dup→409 / weak-pw→422); login → correct role dashboard; reload keeps session; role guard bounces wrong-role access; logout clears storage and returns to `/login`. Backend `tsc` + `eslint` clean; client `vite build` clean.

## Known follow-ups
- Pre-existing `tsc -b` errors in original client files (unused vars; `Badge` missing an `onClick` prop) — predate this work, don't block `vite build`. Clean up in the design-overhaul pass.
- Client dependency audit shows vulnerabilities in the original vite/esbuild tree — revisit during Phase 3 hardening.
- Dashboards still render mock data; they get wired to the API in later phases as each module lands.
