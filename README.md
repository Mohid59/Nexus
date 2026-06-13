# Nexus

Investor & Entrepreneur collaboration platform. Full-stack TypeScript monorepo.

```
/Nexus
  /client    React 18 + TypeScript + Vite + Tailwind + React Router (frontend)
  /server    Node + Express + TypeScript + MongoDB/Mongoose (REST API + Socket.IO)
  /docs       Brief + weekly progress notes
```

## Prerequisites

- Node.js 18+
- MongoDB — a local `mongod`, MongoDB Atlas, or Docker:
  ```bash
  docker run -d --name nexus-mongo -p 27017:27017 -v nexus-mongo-data:/data/db mongo:7
  ```

## Setup

```bash
# Backend
cd server
cp .env.example .env          # then fill in secrets (see below)
npm install
npm run seed                  # creates demo accounts

# Frontend (new terminal)
cd client
cp .env.example .env          # VITE_API_URL=http://localhost:5000/api
npm install
```

### Backend environment (`server/.env`)

| Var | Purpose |
|-----|---------|
| `PORT` | API port (default 5000) |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets (generate long random strings) |
| `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL` | Token lifetimes (e.g. `15m`, `7d`) |
| `COOKIE_SECURE` / `COOKIE_SAMESITE` | Refresh-cookie flags (`true` / `none` in prod) |
| `SMTP_*`, `MAIL_FROM`, `CLIENT_RESET_URL` | Password-reset email (blank SMTP → Ethereal test inbox in dev) |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## Run (two terminals)

```bash
cd server && npm run dev      # API on http://localhost:5000  (docs at /api/docs)
cd client && npm run dev      # app on http://localhost:5173
```

## Demo accounts

Seeded by `npm run seed` (server). Password for all: **`Password123!`**

- Entrepreneurs: `sarah@techwave.io`, `david@greenlife.co`, `maya@healthpulse.com`, `james@urbanfarm.io`
- Investors: `michael@vcinnovate.com`, `jennifer@impactvc.org`, `robert@healthventures.com`

## API surface (Phase 1)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/register` | name, email, password, role |
| POST | `/api/auth/login` | returns access token + sets refresh cookie |
| POST | `/api/auth/refresh` | rotates tokens via httpOnly cookie |
| POST | `/api/auth/logout` | revokes refresh token |
| POST | `/api/auth/forgot-password` · `/reset-password` | email reset flow |
| GET / PATCH | `/api/users/me` | current profile |
| GET | `/api/users/:id` | public profile |
| GET | `/api/investors` · `/api/entrepreneurs` | paginated + searchable lists |

Interactive docs: http://localhost:5000/api/docs

## Scripts

**server:** `npm run dev` · `build` · `start` · `lint` · `typecheck` · `seed`
**client:** `npm run dev` · `build` · `lint` · `preview`

## Roadmap

- **Phase 1 (done):** backend foundation, JWT auth, profiles, protected/role-based routing.
- **Phase 2:** meetings + calendar, WebRTC video, document chamber + e-signature.
- **Phase 3:** Stripe payments, security hardening (2FA), Swagger/Postman docs, Vercel + Render deploy.
