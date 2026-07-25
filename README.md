# Chess Timer

Vite + React + TypeScript setup with PWA support, Tailwind, shadcn/ui wiring, and Cloudflare Pages deployment through GitHub Actions.

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

## Cloudflare Pages CI/CD

The workflow in `.github/workflows/deploy-cloudflare-pages.yml` deploys on pushes to `main`.

Add these GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`
