# Chess Timer

Vite + React + TypeScript setup with PWA support, Tailwind, HeroUI, and Cloudflare Pages hosting.

## Requirements

- Node.js >= 20
- pnpm >= 10

## Local development

```bash
pnpm install
pnpm run dev
```

## Production build

```bash
pnpm run build
pnpm run preview
```

## Testing

Run the full local quality gate:

```bash
pnpm run test:run
pnpm run lint
pnpm run build
```

Notes:
- Unit tests currently focus on store timing logic (delay, increment, undo, timeout, restore TTL).
- Vitest is configured with `jsdom` in `vite.config.ts`.

## Environment variables

Copy `.env.example` to `.env` and set the values:

- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST`
- `VITE_SENTRY_DSN`
- `VITE_SENTRY_ENVIRONMENT`

## Cloudflare Pages

Production deployment is managed by the Cloudflare Pages project rather than GitHub Actions.
For a local or manual deployment, run:

```bash
pnpm run deploy:cloudflare
```
