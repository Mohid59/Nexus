# Nexus — Progress Tracker

Living status of the Nexus build. **Last updated:** 2026-06-14
**Repo:** https://github.com/Mohid59/Nexus · **Tag:** `phase-2`

Legend: ✅ done & verified · 🟡 partial / manual-check needed · ⬜ not started

---

## Deliverables (from the brief)

| Deliverable | Status | Notes |
|---|---|---|
| Auth & profiles | ✅ | JWT access + httpOnly refresh, bcrypt, profiles, lists |
| Protected, role-based routing | ✅ | `ProtectedRoute` + `RoleRoute` |
| Backend integrated (mocks removed per module) | 🟡 | auth/meetings/docs live; messages/deals still mock |
| Meeting calendar | ✅ | react-big-calendar, conflict 409 |
| Video calling | 🟡 | signaling + UI done; live A/V = manual 2-browser test |
| Document chamber + e-signature | ✅ | upload, preview, sign |
| Payment simulation | ⬜ | Phase 3 (Stripe) |
| Security hardening (helmet/CORS/sanitize/rate-limit/zod) | ✅ | 2FA still pending (Phase 3) |
| Redesigned, cohesive UI | ✅ | "Trust & Capital" + dark mode |
| Swagger + Postman docs | 🟡 | Swagger served at `/api/docs`; full annotations + Postman = Phase 3 |
| Vercel + Render deploy configs + README | 🟡 | root README done; deploy configs = Phase 3 |
| Weekly progress notes in `/docs` | ✅ | `docs/phase-1.md`, `docs/phase-2.md` |

---

## Phase 1 — Foundation + auth ✅ (tag-able)
- Monorepo restructure: `/client` (React+Vite+TS) + `/server` (Express+TS+Mongoose) + `/docs`.
- Env-validated config, Mongo connect w/ retry, role-based `User` (bcrypt pre-save).
- Auth API: register/login/refresh/logout/forgot/reset (JWT access + rotating refresh cookie).
- Users API: `/me`, `/:id`, paginated `/investors` + `/entrepreneurs`.
- Frontend: `lib/api.ts` (refresh-on-401), real `AuthContext`, route guards, demo seed (7 users).

## Design overhaul ✅
- "Trust & Capital" tokens (Fraunces + Hanken Grotesk, indigo/teal/copper), upgraded primitives + new ones (Modal, Dropdown, Tabs, EmptyState, Skeleton, StatCard).
- Redesigned shell (sidebar drawer, breadcrumb topbar, profile dropdown).
- **Dark mode** toggle (persisted, system-default) with full token migration.
- **Bold editorial redesign**: split login (brand panel + ring motif + grain), dashboard hero bands; shared `AuthLayout`.

## Phase 2 — Meetings, video, documents ✅ (tag `phase-2`)
- **Meetings:** `Meeting` model + scoped API (create/list/accept/reject/cancel), overlap → 409; calendar page + schedule modal + agenda actions.
- **Documents:** `Document` model + Multer upload + API (upload/list/get/file/sign/share/delete), owner-or-shared access; dropzone + status grid + authed blob preview + e-signature.
- **Video:** JWT Socket.IO signaling + `simple-peer` call screen (`/call/:roomId`); entry from meetings + chat.

## Phase 3 — Payments, security, deploy ⬜ (next)
- ⬜ Stripe (deposit/withdraw/transfer + webhook), wallet UI.
- ⬜ 2FA email OTP at login.
- ⬜ Full Swagger annotations + Postman collection in `/server/docs`.
- ⬜ Vercel (client) + Render (server) deploy configs; expand README.
- ⬜ Smoke-test all modules together; tag + final checkpoint.

---

## Tech stack
**Client:** React 18, TypeScript, Vite, Tailwind 3, React Router 6, axios, react-big-calendar, react-dropzone, react-signature-canvas, socket.io-client, simple-peer.
**Server:** Node, Express 4, TypeScript, Mongoose 8, JWT, bcryptjs, Socket.IO, Multer, Zod, helmet, cors, express-rate-limit, express-mongo-sanitize, nodemailer, swagger.

## Run locally
```bash
# Mongo (Docker)
docker run -d --name nexus-mongo -p 27017:27017 -v nexus-mongo-data:/data/db mongo:7
# Backend
cd server && cp .env.example .env && npm install && npm run seed && npm run dev   # :5000
# Frontend (new terminal)
cd client && cp .env.example .env && npm install && npm run dev                    # :5173/:5174
```
**Demo accounts** (password `Password123!`): `sarah@techwave.io` (entrepreneur), `michael@vcinnovate.com` (investor).
API docs: http://localhost:5000/api/docs

## Commit history (main)
```
ff5e815 docs: Phase 2 progress note
869f53b feat(video): WebRTC video calls — Socket.IO signaling + simple-peer
30a1800 feat(documents): document chamber — upload, preview, e-signature
dcc5d54 feat(meetings): scheduling module — model, API, calendar UI
8fd20b2 refactor(ui): unify auth screens on a shared editorial AuthLayout
4ab1a89 feat(ui): bold editorial redesign — split login + dashboard hero
88dad79 fix(ui): complete dark-mode coverage on deeper pages
686cd20 feat(ui): dark mode toggle + dashboard refinement
c54731b feat(ui): design system overhaul — "Trust & Capital" identity
1fe3688 feat(phase-1): monorepo restructure + real JWT auth backend
```

## Known follow-ups
- Live two-peer video needs two real browsers + cameras (manual checkpoint).
- Messages/chat + deals pages still render mock data — wire to backend later.
- Cloudinary storage driver is a stub seam (dev uses local disk).
- `npm audit` shows vulnerabilities in the original client vite/esbuild tree — revisit in Phase 3.
- Client bundle size warning (calendar + simple-peer + socket.io) — code-split if needed.
