# Nexus — Progress Tracker

Living status of the Nexus build. **Last updated:** 2026-06-15
**Repo:** https://github.com/Mohid59/Nexus · **Latest tag:** `phase-3`
**Live:** app → https://nexus-eta-puce-37.vercel.app · API → https://nexus-api-msck.onrender.com/api/docs (Vercel + Render + MongoDB Atlas)

Legend: ✅ done & verified · 🟡 partial / manual-check needed · ⬜ not started

---

## Deliverables (from the brief)

| Deliverable | Status | Notes |
|---|---|---|
| Auth & profiles | ✅ | JWT access + httpOnly refresh, bcrypt, profiles, lists |
| Protected, role-based routing | ✅ | `ProtectedRoute` + `RoleRoute` |
| Backend integrated (mocks removed per module) | 🟡 | auth/meetings/docs/payments live; messages/deals still mock |
| Meeting calendar | ✅ | react-big-calendar, conflict 409 |
| Video calling | 🟡 | signaling + UI done; live A/V = manual 2-browser test |
| Document chamber + e-signature | ✅ | upload, preview, sign |
| Payment simulation | ✅ | Stripe test-mode + simulated fallback; wallet UI |
| Security hardening | ✅ | helmet/CORS/sanitize/rate-limit/zod + **2FA email OTP** |
| Redesigned, cohesive UI | ✅ | "Trust & Capital" + dark mode + editorial redesign |
| Swagger + Postman docs | ✅ | `/api/docs` full spec + `server/docs/*.postman_collection.json` |
| Vercel + Render deploy configs + README | ✅ | **Live** — Vercel (web) + Render (API) + Atlas (DB); verified end-to-end |
| Weekly progress notes in `/docs` | ✅ | `docs/phase-1.md`, `phase-2.md`, `phase-3.md` |

---

## Phase 1 — Foundation + auth ✅
Monorepo (`/client` + `/server`), env-validated config, Mongo retry, role-based `User` (bcrypt), full auth API (register/login/refresh/logout/forgot/reset), users + paginated lists, `lib/api.ts` (refresh-on-401), real `AuthContext`, route guards, demo seed.

## Design overhaul ✅
"Trust & Capital" tokens (Fraunces + Hanken Grotesk), upgraded + new primitives, redesigned shell, **dark mode** toggle, **bold editorial redesign** (split login, dashboard heroes, shared `AuthLayout`).

## Phase 2 — Meetings, video, documents ✅ (tag `phase-2`)
- Meetings: model + scoped API (overlap → 409) + calendar UI.
- Documents: Multer upload + sign/share/access control + dropzone/preview/e-signature.
- Video: JWT Socket.IO signaling + `simple-peer` call screen (`/call/:roomId`).

## Phase 3 — Payments, security, deploy ✅ (tag `phase-3`)
- **Payments:** Transaction model + balance; deposit (Stripe PaymentIntent/webhook or simulated) / withdraw / transfer; wallet UI + history.
- **2FA:** email OTP at login (Settings toggle, `/auth/verify-2fa`).
- **Docs:** full Swagger at `/api/docs` + Postman collection.
- **Deploy:** `render.yaml` (backend) + `client/vercel.json` (frontend) + README deploy guide. 🟡 not yet deployed.

---

## Tech stack
**Client:** React 18, TypeScript, Vite, Tailwind 3, React Router 6, axios, react-big-calendar, react-dropzone, react-signature-canvas, socket.io-client, simple-peer, @stripe/react-stripe-js.
**Server:** Node, Express 4, TypeScript, Mongoose 8, JWT, bcryptjs, Socket.IO, Multer, Stripe, Zod, helmet, cors, express-rate-limit, express-mongo-sanitize, nodemailer, swagger.

## Run locally
```bash
docker run -d --name nexus-mongo -p 27017:27017 -v nexus-mongo-data:/data/db mongo:7
cd server && cp .env.example .env && npm install && npm run seed && npm run dev   # :5000
cd client && cp .env.example .env && npm install && npm run dev                    # :5173/:5174
```
**Demo** (password `Password123!`): `sarah@techwave.io` (entrepreneur), `michael@vcinnovate.com` (investor). API docs: http://localhost:5000/api/docs

## Commit history (newest first)
```
f1fa75e chore(deploy): Render (backend) + Vercel (frontend) configs
ad36b2c docs(api): full Swagger spec + Postman collection
3c58c02 feat(security): 2FA email OTP at login
5ca9b80 feat(payments): wallet — deposits, withdrawals, transfers (Stripe test mode)
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
- Deploy to Render + Vercel (configs ready); add Stripe webhook + real keys for live payments.
- Live two-peer video needs two real browsers + cameras (manual checkpoint).
- Messages/chat + deals pages still render mock data.
- Cloudinary storage adapter is a stub (Render disk is ephemeral).
- `npm audit` shows vulns in the original client vite/esbuild tree.
