# Claude Code Prompt — Nexus Full-Stack Build

> Paste everything below the line into Claude Code from the root of the cloned `Nexus` repo.
> It is written as a working spec: Claude Code should treat each phase as a checkpoint, commit at the end of each, and ask before any destructive change.

---

You are working in the **Nexus** repository — an Investor & Entrepreneur collaboration platform. The current repo is a **frontend-only React scaffold with all data mocked**. Your job is to turn it into a fully functional full-stack application, add the required feature modules, harden security, redesign the UI, and prepare both halves for deployment.

## Ground rules

- Work in **small, reviewable increments**. After each phase below, run the app, verify it builds, then make a single focused git commit with a clear message. Do not batch unrelated changes.
- **Never delete or overwrite my existing work without telling me first.** If you need to replace a file, summarize what changes and why before doing it.
- Keep the existing **React + TypeScript + Vite + Tailwind + React Router** frontend stack. Do not migrate frameworks.
- Use **TypeScript on the backend too** so the whole codebase is one language.
- Every secret (DB URI, JWT secrets, Stripe keys, SMTP creds) goes in `.env` files that are **gitignored**. Commit `.env.example` files with placeholder keys instead. Never hardcode a secret.
- All new code must be typed, linted (the repo already uses ESLint), and free of `any` unless unavoidable.
- When you finish, the app must work end-to-end locally with `npm run dev` (frontend) and `npm run dev` (backend) running together.

## Current state (already audited — build on this, don't rediscover it)

- Stack: React 18, TypeScript 5, Vite 5, Tailwind 3, react-router-dom 6. Already installed: `axios`, `date-fns`, `react-dropzone`, `react-hot-toast`, `lucide-react`.
- `src/context/AuthContext.tsx` is **fully mocked** — it reads from a hardcoded `users` array, fakes delays with `setTimeout`, and persists the raw user object to `localStorage`. There is **no JWT and no token**.
- All data lives in `src/data/` (`users.ts`, `messages.ts`, `collaborationRequests.ts`).
- Types are defined in `src/types/index.ts`: `User`, `Entrepreneur`, `Investor`, `Message`, `ChatConversation`, `CollaborationRequest`, `Document`.
- Routing in `src/App.tsx` has **no route protection** — every page is publicly reachable. Pages already exist for: login, register, forgot/reset password, entrepreneur & investor dashboards, profiles, investors list, entrepreneurs list, messages, chat, notifications, documents, settings, help, deals.
- No backend exists. No meeting/scheduling, video, payment, or e-signature code exists yet.

## Target architecture

Restructure the repo into a monorepo-style layout without breaking the existing frontend:

```
/Nexus
  /client            <- move the existing frontend here (src, public, vite config, etc.)
  /server            <- new Node + Express + TypeScript backend
  README.md          <- root: how to run both
```

If moving the frontend into `/client` is too disruptive, instead keep the frontend at root and put the backend in `/server`. Pick one, tell me which, and stay consistent.

### Backend stack (use these — they resolve the "or" choices in the brief)

- **Node.js + Express + TypeScript**
- **MongoDB + Mongoose** (flexible schemas suit the investor/entrepreneur profile variety)
- **JWT** auth with short-lived access tokens + refresh tokens (httpOnly cookie for refresh)
- **bcrypt** for password hashing
- **Socket.IO** for real-time (chat + WebRTC signaling)
- **Multer** for uploads; local disk in dev, **Cloudinary or AWS S3** adapter for prod (env-switchable)
- **Stripe** (test mode) for payments
- **Nodemailer** for OTP/2FA email (use Ethereal or Mailtrap in dev)
- **Validation/hardening**: `zod` (request validation), `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `cors` (whitelist the frontend origin)
- **API docs**: `swagger-jsdoc` + `swagger-ui-express`, served at `/api/docs`

### Frontend integration layer

- Create `src/lib/api.ts`: a single axios instance with `baseURL` from `VITE_API_URL`, a request interceptor that attaches the access token, and a response interceptor that transparently refreshes on 401.
- **Replace the mocked `AuthContext`** so `login`, `register`, `logout`, `forgotPassword`, `resetPassword`, and `updateProfile` call the real API. Store only the access token + minimal user object client-side; never store passwords.
- Delete the `src/data/*` mocks **only after** the corresponding feature is wired to the backend, one module at a time.
- Add a `ProtectedRoute` wrapper and a `RoleRoute` wrapper, and apply them in `App.tsx` so investor/entrepreneur dashboards and all authenticated pages require a valid session and the correct role.

---

## Phase 1 — Backend foundation + real authentication (maps to Week 1)

1. Scaffold `/server` with Express + TypeScript, `nodemon`/`tsx` for dev, a `config` module that validates env vars on boot, and a Mongoose connection with retry/logging.
2. Models: `User` (base) with discriminators or a `role` field for `Entrepreneur` and `Investor`, mirroring `src/types/index.ts` (bio, startup/investment history, preferences, etc.). Hash passwords in a pre-save hook.
3. Auth APIs: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`. Issue JWT access + refresh tokens.
4. Profile APIs: `GET /api/users/me`, `PATCH /api/users/me`, `GET /api/users/:id`, plus list endpoints `GET /api/investors` and `GET /api/entrepreneurs` with pagination/filtering to feed the existing list pages.
5. Auth middleware (`requireAuth`) + role middleware (`requireRole('investor' | 'entrepreneur')`).
6. Wire the frontend: real `AuthContext`, `api.ts`, protected/role routes. Seed a couple of demo accounts of each role.
7. **Checkpoint**: register → login → land on the correct role dashboard → refresh page keeps session → logout clears it. Commit.

## Phase 2 — Meetings, video, documents (maps to Week 2)

**Meetings**
- `Meeting` model + APIs to create/list/accept/reject/cancel, scoped to the two participants.
- **Conflict detection**: reject overlapping meetings for either participant; return a clear 409.
- Frontend: a calendar view (use `react-big-calendar` or build on `date-fns`) on the dashboard showing scheduled/pending meetings with accept/reject actions.

**Video calling**
- Socket.IO **WebRTC signaling server** (rooms, offer/answer/ICE relay). Use `simple-peer` on the client to keep it manageable.
- Frontend call screen: join room, local + remote video tiles, toggle mic/camera, end call. Wire a "Start call" action into the meeting and chat views.

**Document Processing Chamber**
- `Document` model storing metadata (uploadedBy, version, status, sharedWith). Upload API via Multer; storage adapter (local dev / Cloudinary or S3 prod).
- Frontend: drag-and-drop upload (reuse `react-dropzone`), document list with status, and **in-browser PDF preview** (`react-pdf` / `@react-pdf-viewer`).
- **E-signature**: capture a signature (canvas, e.g. `react-signature-canvas`), store the signature image linked to the document + signer + timestamp, and reflect a "signed" status.
- **Checkpoint**: schedule a meeting between two seeded users, start a video call between two browser tabs, upload and preview a PDF, sign it. Commit.

## Phase 3 — Payments, security, deployment (maps to Week 3)

**Payments (Stripe test mode)**
- `Transaction` model with status (`pending` | `completed` | `failed`) and type (`deposit` | `withdraw` | `transfer`).
- APIs for deposit (Stripe PaymentIntent), withdraw, and transfer between platform users. Handle the Stripe webhook to flip status to completed/failed.
- Frontend: a wallet/payments section with the Stripe Elements card form and a transaction-history table on the dashboard.

**Security hardening**
- `helmet`, CORS whitelist, `express-rate-limit` on auth routes, `express-mongo-sanitize`, and `zod` validation + sanitization on every endpoint (prevent XSS/NoSQL injection).
- Confirm bcrypt hashing and secure JWT handling (short access TTL, refresh rotation, httpOnly cookie).
- **2FA**: optional email OTP at login via Nodemailer — issue a 6-digit code, verify before completing login. Mock the mail transport in dev.
- Enforce role-based authorization on every protected route.

**Integration + deployment**
- Smoke-test all modules working together against one running backend.
- Frontend deploy config for **Vercel** (set `VITE_API_URL` to the deployed backend); backend deploy config for **Render** (`render.yaml` or clear instructions, env vars documented). Update `vercel.json` if needed.
- Generate **Swagger** docs at `/api/docs` and export a **Postman collection** into `/server/docs`.
- Write the root `README.md`: local setup, env vars, run commands, deploy steps, and a short feature walkthrough for the demo.
- **Checkpoint**: full flow works deployed. Commit + tag.

---

## Frontend design overhaul (do this progressively, alongside the phases)

The current UI is a generic Tailwind scaffold. Give Nexus a deliberate, polished identity suitable for a fintech/collaboration product. Read `/mnt/skills/public/frontend-design/SKILL.md`-style principles if available, otherwise apply these:

- **Design system first**: define a Tailwind theme — a refined color palette (a trustworthy deep indigo/teal primary with a warm accent, proper neutral ramp, semantic success/warning/error), a type scale with a real display + body pairing, consistent spacing, radius, and shadow tokens. Centralize it in `tailwind.config.js`.
- **Reusable primitives**: upgrade the existing `ui/` components (Button, Card, Input, Badge, Avatar) into a coherent set with variants, focus states, and loading/disabled states. Add `Modal`, `Dropdown`, `Tabs`, `Toast` styling, `EmptyState`, and `Skeleton` loaders.
- **Layout**: redesign the dashboard shell (sidebar + topbar) to feel modern — clear active states, responsive collapse, breadcrumbs. Distinguish the **investor** vs **entrepreneur** dashboards visually and by content.
- **Dashboards with substance**: stat cards, recent activity, upcoming meetings, deal pipeline, and quick actions — populated from real APIs, with proper loading and empty states.
- **Polish**: subtle motion (Framer Motion is fine to add), accessible contrast, keyboard navigation, mobile responsiveness, dark-mode-ready tokens, and consistent iconography via the installed `lucide-react`.
- Keep it cohesive — every new feature screen (calendar, call, document chamber, wallet) must use the same design system, not one-off styling.

## Deliverables checklist (the brief's final output)

- [ ] Functional web app: auth & profiles, meeting calendar, video calling, document chamber + e-signature, payment simulation, security features
- [ ] Backend integrated and all frontend mocks removed
- [ ] Protected, role-based routing
- [ ] Redesigned, cohesive UI
- [ ] Swagger + Postman API documentation
- [ ] Frontend (Vercel) + backend (Render) deploy configs and a complete README
- [ ] Weekly-progress notes captured in `/docs` so the demo presentation can be assembled from them

## How to start

Begin with Phase 1 only. First, propose the repo restructure (client/server) and the exact dependency list you'll add to the backend, wait for my confirmation, **then** scaffold the server and implement real authentication end-to-end. Show me the diff of how you'll replace the mocked `AuthContext` before applying it.
