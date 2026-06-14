# Phase 2 — Meetings, video, documents

**Status:** complete. Maps to Week 2 of the brief. Three modules, each committed separately.

## Meetings (`feat(meetings)`)
- **Model:** `Meeting` (organizer, attendee, start/end, status, roomId). `toJSON` → `id`.
- **API** (all `requireAuth`, zod-validated, scoped to the two participants):
  `POST /api/meetings`, `GET /api/meetings` (filter `scope`/`status`), `PATCH /api/meetings/:id/{accept,reject,cancel}`.
- **Conflict detection:** creating or accepting checks for an overlapping *accepted* meeting for either participant → **409**.
- **Frontend:** `MeetingsPage` with `react-big-calendar` (themed light + dark, status-colored events), a schedule modal (counterpart picker + datetime), and an upcoming agenda with accept/reject/cancel + join-call. New `/meetings` route + sidebar nav.

## Documents (`feat(documents)`)
- **Model:** `Document` (originalName, storageKey [hidden in JSON], mimeType, size, uploadedBy, sharedWith, status, version, signatures[{signer, image, signedAt}]).
- **Upload:** Multer disk storage → `server/uploads/` (gitignored), 10 MB limit, type-filtered (pdf/images/word/txt). Storage seam left for a Cloudinary driver via `STORAGE_DRIVER`.
- **API:** `POST /api/documents` (multipart), `GET /api/documents`, `GET /:id`, `GET /:id/file` (auth'd stream), `POST /:id/sign`, `POST /:id/share`, `DELETE /:id`. Owner-or-shared access control.
- **E-signature:** `react-signature-canvas` captures a PNG data URL → stored on the doc with signer + timestamp → status `signed`.
- **Frontend:** `DocumentsPage` — `react-dropzone` upload, document grid with status badges, **authenticated blob preview** (PDF in an iframe / images inline; avoids exposing tokens in URLs), and the sign modal. Added to both sidebars.

## Video (`feat(video)`)
- **Signaling:** JWT-authenticated Socket.IO. Rooms relay peer discovery + offer/answer/ICE: `call:join` → `call:peers` (joiner initiates) / `call:peer-joined` / `call:signal` / `call:peer-left`.
- **Frontend:** `lib/socket.ts` (token-authed socket); `CallPage` (`getUserMedia`, `simple-peer` mesh, local + remote tiles, mic/camera toggle, end call, graceful no-media state). Full-screen `/call/:roomId`. Entry points: "Join call" on accepted meetings + the chat video button. Vite node polyfills added so simple-peer bundles.

## Decisions
- PDF preview via authenticated blob + `<iframe>` instead of `react-pdf` — keeps the auth header (protected files) and avoids pdf.js worker setup in Vite.
- Calendar is a dedicated `/meetings` page (cleaner than embedding in the role dashboards).

## Verified
- Meetings + Documents APIs smoke-tested end to end (incl. 409 overlap, 403 scoping, sign, share, authed download).
- Client `tsc -b` + `eslint` clean (2 benign context warnings); `vite build` green.
- Call screen renders + degrades gracefully without a camera.

## Known follow-ups
- **Live two-peer video** needs two real browsers with cameras — manual checkpoint, not verifiable headlessly.
- Cloudinary storage driver is a stub seam (dev uses local disk).
- Bundle size warning (simple-peer + socket.io + calendar) — code-split later if needed.
- Messages/chat are still on mock data; wire to a backend in a later pass.
