# Phase 3 — Payments, security, deployment

**Status:** complete (code + configs). Maps to Week 3 of the brief.

## Payments — Stripe test mode (`feat(payments)`)
- **Transaction** model + `User.balance` (cents, stripped from serialization so it never leaks via user lists).
- **API:** `GET /payments/wallet`, `GET /payments/transactions` (paginated), `POST /deposit`, `POST /withdraw`, `POST /transfer`.
- **Deposit:** real Stripe PaymentIntent when `STRIPE_SECRET_KEY` is set (a raw-body webhook flips status → completed + credits balance on `payment_intent.succeeded`); otherwise simulated/instant.
- **Withdraw / transfer:** atomic balance guards (`findOneAndUpdate` with `$gte`), insufficient funds → 400.
- **Wallet UI:** balance hero, deposit/withdraw/transfer modals, transaction-history table; Stripe Elements gated behind `VITE_STRIPE_PUBLISHABLE_KEY`. New `/wallet` route + sidebar nav.

## Security (`feat(security)`)
- Already shipped in Phase 1: helmet, CORS whitelist, `express-rate-limit` on auth, `express-mongo-sanitize`, zod validation everywhere, bcrypt, short-lived JWT access + rotating httpOnly refresh, role-based authorization.
- **New — 2FA email OTP at login:** per-user toggle in Settings; on login a hashed 6-digit code (5-min expiry) is emailed (nodemailer) and a short-lived pending token is returned instead of a session; `POST /auth/verify-2fa` checks the code, then issues tokens.

## API docs + deployment
- **Swagger** at `/api/docs` — full schemas + paths for auth, users, meetings, documents, payments.
- **Postman** collection at `server/docs/Nexus.postman_collection.json` (folder per domain, `baseUrl`, login auto-saves `accessToken`).
- **Deploy:** `render.yaml` (backend blueprint — build/start, health check, env vars, auto-generated JWT secrets) + `client/vercel.json` (SPA routing) + README deployment section.

## Verified
- Payments smoke-tested (deposit/withdraw/transfer, balances, insufficient → 400) and 2FA smoke-tested (enable → OTP login → verify; wrong code → 401).
- Backend `tsc` clean; client `tsc -b` + `eslint` clean (2 benign context warnings); `vite build` green.

## Known follow-ups
- Live Stripe card flow + webhook require test keys + Stripe CLI/dashboard (simulated path runs without them).
- Cloudinary storage adapter is still a stub — Render disk is ephemeral, so wire it before relying on prod uploads.
- Actual Render/Vercel deploy not performed here; configs are ready to import.
- Live two-peer video (Phase 2) still needs two real browsers with cameras.
