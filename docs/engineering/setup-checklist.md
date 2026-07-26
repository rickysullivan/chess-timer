# Engineering Setup Checklist (Pre-Sprint)

These tasks are required before user-value stories. They are prerequisites, not epics.

## Required Setup Tasks

1) Initialize project with Vite PWA React TS starter:
   - `npm create @vite-pwa/pwa@latest chess-timer -- --template react-ts`

2) Configure Cloudflare Pages deployment:
   - Connect the repository and configure the build command as `npm run build`.
   - Set the output directory to `dist` and manage deployment settings in Cloudflare.

3) Document local development environment:
   - `.env.example` includes required PostHog + Sentry keys.
   - App runs locally without runtime configuration errors.

4) Confirm Node version minimum:
   - Target Node >= 20 (aligned with Vite + React Router).

5) Add shadcn/ui + Tailwind post-init:
   - Install shadcn/ui in Vite app.
   - Configure Tailwind with shadcn defaults.
