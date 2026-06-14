# Deploying Nexus

Three free services: **MongoDB Atlas** (database), **Render** (backend API), **Vercel** (frontend).
Order matters because the two apps reference each other's URLs.

Repo: https://github.com/Mohid59/Nexus — already contains `render.yaml` and `client/vercel.json`.

---

## Step 1 — MongoDB Atlas (database)

1. Sign up at https://www.mongodb.com/cloud/atlas → create a **free M0 cluster**.
2. **Database Access** → Add a database user (username + password). Save them.
3. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`).
4. **Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nexus?retryWrites=true&w=majority
   ```
   Replace `<user>`/`<password>` and add the db name `nexus` before the `?` (as above).
   **This is your `MONGO_URI`.**

> Send me the `MONGO_URI` and I'll seed the demo accounts into Atlas for you (Step 1b), or run it yourself:
> ```bash
> # from the server/ folder, with MONGO_URI set to the Atlas string
> MONGO_URI="<atlas-uri>" npm run seed
> ```

---

## Step 2 — Render (backend API)

1. Sign up at https://render.com (log in with GitHub).
2. **New → Blueprint** → connect the `Mohid59/Nexus` repo. Render reads `render.yaml` and proposes the `nexus-api` web service (root dir `server`).
3. Before/after first deploy, set the env vars marked "set this" (Render dashboard → service → Environment):

   | Var | Value |
   |---|---|
   | `MONGO_URI` | your Atlas string from Step 1 |
   | `CLIENT_ORIGIN` | leave blank for now (fill in Step 4) |
   | `CLIENT_RESET_URL` | leave blank for now (fill in Step 4) |

   `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` auto-generate. `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none` are preset for cross-site.
4. Deploy. When live you get a URL like `https://nexus-api.onrender.com`.
5. Verify:
   - `https://nexus-api.onrender.com/api/health` → `{"status":"ok",...}`
   - `https://nexus-api.onrender.com/api/docs` → Swagger UI

> First request after idle is slow (~50s) on Render's free tier — that's the cold start, not a bug.

---

## Step 3 — Vercel (frontend)

1. Sign up at https://vercel.com (log in with GitHub) → **Add New → Project** → import `Mohid59/Nexus`.
2. **Root Directory → `client`** (important).
3. Framework auto-detects **Vite** (build `npm run build`, output `dist`). `client/vercel.json` handles SPA routing.
4. **Environment Variables:**
   | Var | Value |
   |---|---|
   | `VITE_API_URL` | `https://nexus-api.onrender.com/api` (your Render URL + `/api`) |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | optional (leave blank → simulated wallet) |
5. Deploy. You get a URL like `https://nexus-xxxx.vercel.app`.

---

## Step 4 — Connect them (CORS + cookies)

1. Back in **Render → Environment**, set:
   | Var | Value |
   |---|---|
   | `CLIENT_ORIGIN` | `https://nexus-xxxx.vercel.app` (your Vercel URL, no trailing slash) |
   | `CLIENT_RESET_URL` | `https://nexus-xxxx.vercel.app/reset-password` |
2. Save → Render redeploys. Done.

---

## Step 5 — Verify the live app

1. Open the Vercel URL → editorial login.
2. Click **Investor Demo** (or `michael@vcinnovate.com` / `Password123!`) → dashboard.
3. Try Meetings, Documents, Wallet.

---

## Caveats (free-tier realities)

- **Cold starts:** Render free spins down after ~15 min idle; first hit takes ~50s.
- **Refresh cookie:** it's cross-site (Vercel ↔ Render). Modern Chrome allows it (`SameSite=None; Secure`), but Safari / strict privacy modes may block third-party cookies, so the session may not auto-refresh after the 15-min access token expires (user re-logs in). Fix later by putting both behind one domain.
- **File uploads:** Render's disk is ephemeral — uploaded documents disappear on redeploy/restart. Wire the Cloudinary adapter (`STORAGE_DRIVER=cloudinary` + keys) for persistence.
- **Email (2FA / password reset):** without `SMTP_*`, codes/links are logged server-side only. Add Mailtrap/SMTP creds in Render to send real email.
- **Stripe:** add `STRIPE_SECRET_KEY` (Render) + `VITE_STRIPE_PUBLISHABLE_KEY` (Vercel) + webhook `https://nexus-api.onrender.com/api/payments/webhook` for live test-mode cards. Without keys, the wallet runs in simulated mode.
