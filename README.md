# Chess Timer

Vite + React + TypeScript setup with PWA support, Tailwind, HeroUI, and Cloudflare Pages hosting.

## Requirements

- Node.js >= 20
- npm >= 10

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Testing

Run the full local quality gate:

```bash
npm run test:run
npm run lint
npm run build
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
npm run deploy:cloudflare
```
