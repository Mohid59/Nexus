# Nexus Design System — "Trust & Capital"

A light, editorial fintech identity: confident, trustworthy, premium. Use these tokens and
primitives for every new screen so the product stays cohesive.

## Typography
- **Display:** Fraunces (serif) — headings (`font-display`, auto-applied to `h1`–`h4`).
- **Body:** Hanken Grotesk (`font-sans`, the default).
- Loaded via Google Fonts `@import` in `src/index.css`.

## Color (in `tailwind.config.js`)
- `primary` — indigo ink (anchor `#312E81`). Primary actions, active states.
- `secondary` — deep teal (`#0F766E`). Investor accents, secondary actions.
- `accent` — warm copper (`#C2683A`). Highlights, entrepreneur accents.
- `gray` — warm neutral ramp (replaces default cool gray).
- `success` / `warning` / `error` — semantic.
- **Theme surfaces** via CSS variables (dark-mode-ready, flip under `.dark`): `paper`,
  `surface`, `ink`, `muted`, `line`. Use `bg-surface`, `text-ink`, `text-muted`,
  `border-line` for chrome so dark mode works later. `bg-app` adds the atmospheric gradient.

## Tokens
- Radius: cards `rounded-2xl`, controls `rounded-lg`, pills `rounded-full`.
- Shadow: `shadow-soft` (controls), `shadow-card` (cards), `shadow-lift` (hover/overlays).
- Motion (CSS keyframes): `animate-fade-in` (route content), `animate-slide-up`,
  `animate-scale-in` (modals/dropdowns). Cards lift on hover.

## Primitives (`src/components/ui/`)
`Button` (9 variants × 5 sizes, loading/disabled), `Card` (+ Header/Body/Footer),
`Input` (label/error/adornments), `Badge` (clickable), `Avatar` (status ring),
`Modal`, `Dropdown` (+ Item/Divider), `Tabs`, `EmptyState`, `Skeleton`.
Toasts: themed `react-hot-toast` `<Toaster/>` mounted in `App.tsx`.

## Shell (`src/components/layout/`)
- `Sidebar` — fixed on desktop, drawer on mobile; brand, role chip, active accent bar,
  role-aware nav (investor vs entrepreneur), support card.
- `Navbar` — sticky topbar: breadcrumbs, notifications, profile dropdown (Profile /
  Settings / Log out).
- `DashboardLayout` — `bg-app`, `lg:pl-64`, max-w-7xl content with fade-in.

## Rules
- New feature screens (calendar, call, wallet, documents) MUST use these primitives and
  tokens — no one-off styling.
- Reach for `text-ink`/`text-muted`/`bg-surface`/`border-line` over hardcoded gray/white
  so the future dark theme works.
