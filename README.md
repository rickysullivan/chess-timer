# PlyChss

Every ply counts.

PlyChss is a mobile-first, two-player chess clock built with Vite, React, TypeScript, and HeroUI. It is an installable PWA that works offline after its first successful load and does not require an account.

The live app is [plychss.app](https://plychss.app/).

## Features

- Preset and custom time controls, including increment.
- Single-tap turn switching with pause, resume, reset, and undo.
- Adaptive and classic board layouts.
- Sound, vibration, keep-screen-awake, high-contrast, and large-digit settings.
- Local persistence for settings, the last-used control, and a recent in-progress game.
- Browser installation and link sharing where supported.

## Requirements

- Node.js 20 or newer
- pnpm 10 (the repository uses pnpm `10.13.1`)

## Development

Install dependencies and start the Vite development server:

```bash
pnpm install
pnpm dev
```

To install exactly from the lockfile, use:

```bash
pnpm install --frozen-lockfile
```

## Scripts

```bash
pnpm dev          # Start the development server
pnpm build        # Type-check and create a production build in dist/
pnpm preview      # Preview the production build locally
pnpm test         # Run Vitest in watch mode
pnpm test:run     # Run the test suite once
pnpm lint         # Run ESLint
```

Run the local quality gate with:

```bash
pnpm test:run && pnpm lint && pnpm build
```

Tests use Vitest with the `jsdom` environment. The current unit coverage focuses on timer state transitions, increments, undo, timeouts, reset behavior, and persisted-game restore expiry.

## Environment variables

Copy `.env.example` to `.env` when configuring optional telemetry or local Cloudflare deployment:

```bash
cp .env.example .env
```

The optional build-time telemetry variables are:

- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENVIRONMENT`

`CLOUDFLARE_ACCOUNT_ID` can be set to select a different Cloudflare account for a manual deployment. Do not put secrets in `VITE_*` variables: Vite exposes those values to the client bundle.

## Cloudflare Pages deployment

Production is hosted by the Cloudflare Pages project `plychss` at [plychss.app](https://plychss.app/). Production deployment is managed by the connected Cloudflare Pages project, not by GitHub Actions.

Cloudflare Pages should use:

- Build command: `pnpm run build`
- Build output directory: `dist`
- Production branch: `main`

For an authenticated local/manual deployment, run:

```bash
pnpm dlx wrangler login
pnpm deploy:cloudflare
```

The deploy script builds the app and uploads the compiled `dist/` directory to the `plychss` Pages project. `wrangler.jsonc` intentionally does not contain an `account_id`; account selection is provided through `CLOUDFLARE_ACCOUNT_ID`.
