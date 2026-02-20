# Engineering Setup Checklist (Pre-Sprint)

These tasks are required before user-value stories. They are prerequisites, not epics.

## Required Setup Tasks

1) Initialize project with Vite PWA React TS starter:
   - `npm create @vite-pwa/pwa@latest chess-timer -- --template react-ts`

2) Configure CI/CD to deploy to Cloudflare Pages:
   - GitHub Actions workflow builds and deploys on main.
   - Build-time environment variables injected via CI.

3) Document local development environment:
   - `.env.example` includes required PostHog + Sentry keys.
   - App runs locally without runtime configuration errors.

4) Confirm Node version minimum:
   - Target Node >= 20 (aligned with Vite + React Router).

5) Add shadcn/ui + Tailwind post-init:
   - Install shadcn/ui in Vite app.
   - Configure Tailwind with shadcn defaults.
