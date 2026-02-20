---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-chess-timer-2026-01-29.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/ux-flow-notes.md
  - docs/ux-flow-tournament-traveler.md
  - docs/ux-flow-club-organizer.md
  - docs/ux-flow-casual-duo.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-08'
project_name: 'chess-timer'
user_name: 'Ricky'
date: '2026-02-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
32 FRs spanning:
- Setup & time controls (presets, custom base/increment/delay, start, last-used)
- Turn switching & interaction (single-tap switch, adaptive 80/20 vs classic 50/50, pause via inactive strip)
- Game control & recovery (pause/resume, reset, undo, end on zero)
- Settings & preferences (sound, vibration, keep-awake, layout mode)
- Accessibility & clarity (high contrast, large digits, non-color cues)
- Install/offline access (PWA install, offline after first load, local persistence, restore state)
- Device/layout support (portrait/landscape)
- Sharing & entry (shareable URLs)
- Analytics instrumentation for core events

Architecturally, these require a precise timer engine, a state machine for play/paused/ended with undo, offline-capable shell, reliable local persistence, and a view state manager to coordinate UI states (setup, running, paused, ended, settings) without losing game context.

**Non-Functional Requirements:**
- Performance: <=50ms median tap-to-switch; <=1s start-to-running; INP <=200ms
- Reliability: <=100ms drift/10min; <=1% missed taps; 100% offline flow pass; state restoration after 30 minutes
- Accessibility: WCAG 2.1 AA, contrast >=4.5:1, targets >=44px, reduced motion support
- Privacy/Security: no PII, local-only storage
- UX constraints: adaptive 80/20 layout, pause gesture on inactive strip, rotated timer digits for opposite seating, minimal chrome

**Scale & Complexity:**
- Primary domain: mobile-first web PWA
- Complexity level: low-to-medium (single-device, no backend sync, but high precision timing + offline)
- Estimated architectural components: 7-9 (UI shell, timer engine/state machine, view state manager, settings, persistence, offline/service worker, analytics, platform integrations like Wake Lock)

### Technical Constraints & Dependencies
- PWA installability and Service Worker support across modern mobile browsers
- Wake Lock API availability with graceful fallback messaging
- High-resolution timing APIs (performance.now) and visibility handling
- Local persistence (localStorage/IndexedDB) for settings and game state
- Analytics event schema completeness without PII
- Responsive layout with safe-area insets and rotated timer digits

### Cross-Cutting Concerns Identified
- Offline-first behavior and cache strategy for app shell/assets
- Timing accuracy and drift control under background/visibility changes
- State persistence and recovery without data loss
- Accessibility and reduced-motion compliance
- Consistent analytics instrumentation for core actions

## Starter Template Evaluation

### Primary Technology Domain

Web application (React + TypeScript) with offline-first PWA requirements.

### Starter Options Considered

**Option A: Vite React TS (create-vite)**
- Command: `npm create vite@latest chess-timer -- --template react-ts`
- Pros: minimal baseline, maximum control.
- Cons: must add PWA config and service worker manually.

**Option B: Vite PWA React TS (create-pwa)**
- Command: `npm create @vite-pwa/pwa@latest chess-timer -- --template react-ts`
- Pros: PWA scaffolding included (manifest + SW), aligned with offline-first requirement.
- Cons: still requires shadcn/ui + Tailwind setup.

**Option C: shadcn/create (Vite)**
- Pros: fastest path to shadcn/ui + Tailwind + TS configuration.
- Cons: no PWA scaffolding; would still need PWA setup.

### Selected Starter: Vite PWA React TS (create-pwa)

**Rationale for Selection:**
- Offline-first behavior is core to the product, so starting with an official PWA template reduces risk.
- Compatible with Vite + React TS and allows shadcn/ui to be layered cleanly.
- Keeps the architecture lean and Cloudflare-friendly.

**Initialization Command:**

```bash
npm create @vite-pwa/pwa@latest chess-timer -- --template react-ts
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:** TypeScript + React  
**Styling Solution:** None (we’ll add Tailwind + shadcn/ui)  
**Build Tooling:** Vite (modern dev server + optimized build)  
**Testing Framework:** None (to be selected later)  
**Code Organization:** Standard Vite structure; app entry in `src/`  
**Development Experience:** HMR, fast rebuilds, PWA manifest + service worker scaffolding  

**Post-Init Step:** Run shadcn/ui setup for Vite and add Tailwind.

**Version Freshness Checks (post-init):**
- Confirm latest toolchain versions before first commit:
  - `npm view @vite-pwa/pwa version`
  - `npm view vite version`
  - `npm view vite-plugin-pwa version`
  - `npm view react version`
  - `npm view typescript version`
  - `npm view shadcn@latest version`
  - `npm view tailwindcss version`
  - `npm view @tailwindcss/vite version`
- After scaffolding, run `npm outdated` and update any core tooling if needed.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Client-only PWA (no backend API); offline-first by design.
- localStorage-only persistence for settings, last-used control, and in-progress game.
- Custom timer state machine (idle → running → paused → ended) for deterministic timing.
- State management with Zustand (v5.0.11).
- Timer updates via requestAnimationFrame with derived display time.
- Minimal routing with React Router DOM (v7.13.0) for `/` only; settings remain an in-game drawer.
- Hosting on Cloudflare Pages with GitHub Actions CI/CD.
- Analytics via PostHog (posthog-js v1.342.1) and error tracking via Sentry (@sentry/react v10.38.0).

**Important Decisions (Shape Architecture):**
- Zod for data validation (v4.3.6).
- Anonymous session ID stored locally for analytics distinct_id.
- Security headers enforced at Cloudflare (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Build-time environment configuration only (Vite `import.meta.env`).
- Feature-based frontend architecture (screens/domains/components/hooks).

**Deferred Decisions (Post-MVP):**
- Role-based authorization (future multi-user).
- Serverless API endpoints (future).
- IndexedDB for session logs (future).
- Cloudflare analytics (optional later).
- Testing framework selection (to be decided during implementation planning).

### Data Architecture

- **Storage:** localStorage only for settings, last-used control, anonymous session ID, and in-progress game state.  
  **Rationale:** no PII and minimal persistence needs; lowest complexity.  
- **Data modeling:** simple JSON objects for settings/control/game state.  
- **Restore TTL:** rehydrate game state only if `lastUpdated` <= 30 minutes; otherwise reset to last-used control.
- **Defaults:** on first launch set `sound=true`, `vibration=true`, `layout_mode=adaptive`.
- **Validation:** Zod v4.3.6 for custom control inputs and persisted state.  
- **Provided by starter:** No.

### Authentication & Security

- **Auth:** optional anonymous session ID (no login).  
- **Authorization:** none; role-based auth deferred.  
- **Security headers:** CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy via Cloudflare.  
- **Data protection:** no encryption required (no PII); local-only persistence.

### API & Communication Patterns

- **Backend API:** none (client-only PWA).  
- **Analytics:** PostHog JS v1.342.1.  
- **Error handling:** Sentry React v10.38.0 with error boundary + global handler.  
- **Rate limiting:** not applicable.
- **Analytics schema:** snake_case names/properties; include `session_id` and `layout_mode` on core events; event time fields (e.g., `elapsed_seconds`) are seconds, converted from internal ms.

### Frontend Architecture

- **State management:** Zustand v5.0.11 for app/game/settings state.  
- **State modeling:** custom timer state machine module for deterministic transitions.  
- **View state manager:** separate UI state mapping (setup/running/paused/ended/settings).  
- **Routing:** React Router DOM v7.13.0 with minimal routes (`/` only); settings remain an in-game drawer (no full-page navigation).  
- **Component architecture:** feature-based structure by domain.  
- **Performance:** rAF-based timer updates; derive display time; minimize re-renders.

### Infrastructure & Deployment

- **Hosting:** Cloudflare Pages (static PWA).  
- **CI/CD:** GitHub Actions deploy to Pages.  
- **Env config:** build-time only (`import.meta.env`).  
- **Monitoring:** Sentry + PostHog only (no Cloudflare analytics).  
- **Scaling:** CDN-only for static assets (no backend scaling).  
- **PWA:** service worker + manifest from create-pwa starter.
- **Caching strategy:** network-first for HTML/app shell, cache-first for static assets; offline fallback to cached shell.

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialize project with Vite PWA starter.
2. Add Tailwind + shadcn/ui setup.
3. Implement Zustand store + custom state machine.
4. Implement rAF timer engine + drift handling.
5. Add localStorage persistence + Zod validation.
6. Configure service worker caching strategies.
7. Add React Router minimal routing (single `/` route; settings drawer overlay).
8. Integrate PostHog + Sentry with anonymous session ID.
9. Configure Cloudflare Pages + GitHub Actions pipeline.

**Cross-Component Dependencies:**
- Timer engine depends on state machine; view state manager consumes timer state and layout mode.
- localStorage persistence feeds state initialization and analytics distinct_id.
- Offline behavior depends on service worker configuration from the starter.
- Sentry/PostHog integration requires consistent event/state boundaries.
- Routing and settings drawer must not interrupt active game state.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** naming, folder structure, state management, event schema, time units, error/loading UX, persistence keys.

### Naming Patterns

**Database Naming Conventions:** N/A (no database).  
**API Naming Conventions:** N/A (no backend API).

**Code Naming Conventions:**
- Components: `PascalCase.tsx` (e.g., `TimerSurface.tsx`)
- Hooks: `useX.ts` (e.g., `useTimerEngine.ts`)
- Utils: `camelCase.ts` (e.g., `formatTime.ts`)
- Folders: `kebab-case` (e.g., `features/game-control/`)

### Structure Patterns

**Project Organization:**
- `src/features/<feature>/{components,hooks,stores,types}`
- `src/shared/{ui,lib}`
- Timer engine + state machine live in `src/features/timer-engine/` (or `features/game/`) and export via `shared/lib` if reused.
- Co-locate tests as `*.test.ts`/`*.test.tsx` next to the module they verify.

**File Structure Patterns:**
- Shared utilities in `src/shared/lib`
- Shared UI in `src/shared/ui`
- Feature types in `src/features/<feature>/types`

### Format Patterns

**Data Formats:**
- JSON and state objects use `camelCase` fields.
- Local persistence keys use a single prefix: `chess_timer.*` (e.g., `chess_timer.settings`, `chess_timer.game_state`, `chess_timer.session_id`).
- Time units are **milliseconds** internally; display formatting is centralized in `formatTime` util.

### Communication Patterns

**Event System Patterns (PostHog):**
- Event names in `snake_case` (e.g., `game_start`, `turn_switch`, `pause`).
- Event properties in `snake_case` (e.g., `control_type`, `base_minutes`).
- Always include `session_id` and `layout_mode` on core events.
- Event time properties use seconds (e.g., `elapsed_seconds`); convert from internal ms in analytics layer.

**State Management Patterns (Zustand):**
- Single store with slices: `game`, `settings`, `view`.
- Actions in `camelCase` verbs (e.g., `startGame`, `switchTurn`, `pauseGame`).
- Immutable updates (no direct mutation).
- Selectors live in each feature’s `stores` folder.

### Process Patterns

**Error Handling:**
- Use non-blocking status strip + toast for warnings/info.
- Use confirm dialogs only for destructive actions (reset, clear game).
- All exceptions go through Sentry with context (state + route).

**Loading States:**
- Avoid blocking loaders for core flows; show inline status if needed.
- Use a single `appStatus` field in view slice for transient states.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use milliseconds internally for time and convert only at display.
- Follow the naming and folder conventions above.
- Use the single Zustand store with slices (no new stores).

**Pattern Enforcement:**
- PR reviews must check naming/structure consistency.
- If a pattern must change, update this section before code changes.

### Pattern Examples

**Good Examples:**
- `src/features/game-control/components/TimerSurface.tsx`
- `src/features/timer-engine/stores/useTimerStore.ts`
- Event: `posthog.capture("turn_switch", { turn_index, layout_mode, session_id })`

**Anti-Patterns:**
- Mixing seconds and milliseconds across modules.
- Multiple independent Zustand stores with overlapping state.
- Event names like `turnSwitch` or `TurnSwitch`.

## Project Structure & Boundaries

### Complete Project Directory Structure
```
chess-timer/
├── README.md
├── package.json
├── package-lock.json
├── components.json                  # shadcn/ui config
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.ts
├── .env.example
├── .gitignore
├── public/
│   ├── icons/
│   ├── robots.txt                   # noindex app
│   └── manifest.webmanifest
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── index.css
│   ├── app/
│   │   ├── store.ts                 # Zustand store with slices
│   │   ├── providers.tsx
│   │   └── hooks.ts
│   ├── features/
│   │   ├── setup/
│   │   │   ├── components/
│   │   │   │   ├── PresetList.tsx
│   │   │   │   └── CustomControlForm.tsx
│   │   │   ├── stores/
│   │   │   │   └── settingsSlice.ts
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   ├── gameplay/
│   │   │   ├── components/
│   │   │   │   ├── TimerSurface.tsx
│   │   │   │   ├── ControlBand.tsx
│   │   │   │   └── PauseOverlay.tsx
│   │   │   ├── stores/
│   │   │   │   └── gameSlice.ts
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   ├── timer-engine/
│   │   │   ├── lib/
│   │   │   │   ├── stateMachine.ts
│   │   │   │   ├── timerEngine.ts
│   │   │   │   └── driftControl.ts
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   ├── layout/
│   │   │   ├── components/
│   │   │   │   └── AdaptiveLayout.tsx
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   └── SettingsDrawer.tsx
│   │   │   ├── stores/
│   │   │   │   └── viewSlice.ts
│   │   │   └── types/
│   │   ├── sharing/
│   │   │   ├── components/
│   │   │   │   └── ShareLink.tsx
│   │   │   └── hooks/
│   │   ├── pwa/
│   │   │   ├── hooks/
│   │   │   │   └── usePwaInstall.ts
│   │   │   └── lib/
│   │   │       └── swEvents.ts
│   │   └── analytics/
│   │       ├── lib/
│   │       │   ├── posthog.ts
│   │       │   └── sentry.ts
│   │       └── types/
│   ├── shared/
│   │   ├── ui/                       # shadcn components
│   │   └── lib/
│   │       ├── formatTime.ts
│   │       ├── storage.ts
│   │       ├── wakeLock.ts
│   │       ├── timeUnits.ts
│   │       └── constants.ts
│   └── assets/
│       └── fonts/
└── .github/
    └── workflows/
        └── deploy.yml
```

### Architectural Boundaries

**API Boundaries:**
- No backend API; external services only: PostHog + Sentry.

**Component Boundaries:**
- UI renders via feature components; timer engine is headless in `features/timer-engine/lib`.
- View state manager lives in `features/settings/stores/viewSlice.ts` + `app/store.ts`.

**Service Boundaries:**
- Analytics integrations isolated in `features/analytics/lib`.
- PWA/Service Worker interactions isolated in `features/pwa/lib`.

**Data Boundaries:**
- Persistence limited to `shared/lib/storage.ts` (localStorage).
- Anonymous session ID stored and accessed only through storage utility.

### Requirements to Structure Mapping

**Feature Mapping (FR Categories → Directories):**
- Setup & Time Controls → `features/setup`
- Turn Switching & Adaptive Interaction → `features/gameplay` + `features/layout`
- Timer Engine & State Machine → `features/timer-engine`
- Settings & Preferences → `features/settings`
- Accessibility & Clarity → `shared/ui` + `features/gameplay`
- Install/Offline Access → `features/pwa`
- Device/Layout Support → `features/layout`
- Sharing & Entry → `features/sharing`
- Analytics & Instrumentation → `features/analytics`

**Cross-Cutting Concerns:**
- Timing accuracy → `features/timer-engine/lib`
- Persistence → `shared/lib/storage.ts`
- Wake lock → `shared/lib/wakeLock.ts`
- Event schema → `features/analytics/lib/posthog.ts`

### Integration Points

**Internal Communication:**
- Zustand store slices in `app/store.ts` are the single source of truth.
- Components consume store selectors and timer-engine hooks.

**External Integrations:**
- PostHog and Sentry initialized once in `features/analytics/lib`.
- Service worker registration handled in `features/pwa/lib/swEvents.ts`.

**Data Flow:**
- User actions → store actions → timer engine → view state update → UI render.
- Persisted state rehydrates store on app load; analytics events emitted from store actions.

### File Organization Patterns

**Configuration Files:** root configs (Vite, Tailwind, TS, shadcn).  
**Source Organization:** `features/` for domain logic; `shared/` for reusable UI/lib.  
**Test Organization:** co-locate `*.test.ts(x)` beside modules.  
**Asset Organization:** `public/` for PWA/manifest/icons; `src/assets/` for fonts.

### Development Workflow Integration

**Development Server Structure:** Vite dev server serves `src/` + `public/`.  
**Build Process Structure:** Vite builds static assets; service worker handled by PWA plugin.  
**Deployment Structure:** GitHub Actions builds and deploys to Cloudflare Pages.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- Vite PWA + React TS + Zustand + Zod + PostHog/Sentry remain compatible and aligned with client-only PWA delivery.
- Cloudflare Pages + GitHub Actions fits the static deployment model.
- React Router v7 is appropriate for minimal routing needs.

**Pattern Consistency:**
- Naming, folder structure, event schema conventions, and time-unit rules are internally consistent.
- Single Zustand store with slices aligns with feature-based structure.

**Structure Alignment:**
- Project tree supports the architecture and isolates integrations (analytics, PWA).
- Boundaries for timer engine, persistence, and UI are clear and enforceable.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
- All PRD epics are covered by feature modules (setup, gameplay, layout, settings, sharing, analytics, PWA).

**Functional Requirements Coverage:**
- All FR categories map to concrete architectural components and flows.

**Non-Functional Requirements Coverage:**
- Performance: rAF timer engine + minimal render updates address latency/INP targets.
- Reliability: state machine + persistence + visibility handling supports drift and restore.
- Accessibility: WCAG 2.1 AA alignment baked into UI architecture and patterns.
- Security/privacy: local-only storage, no PII, CSP via Cloudflare.

### Implementation Readiness Validation ✅

**Decision Completeness:**
- Core decisions documented with versions and rationale.
- Implementation patterns and conflict points are specified.

**Structure Completeness:**
- Full directory structure and integration points defined.

**Pattern Completeness:**
- Naming/structure/event conventions are defined, with examples and enforcement notes.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps:** None (clarifications added for caching strategy, restore TTL, analytics schema/time units).

**Nice-to-Have:**
- Document Node version minimum (>=20) in README.

### Validation Issues Addressed

- Added explicit caching strategy (network-first HTML, cache-first assets).
- Added game-state restore TTL (<= 30 minutes).
- Clarified analytics schema and event time units.
- Documented default settings (sound/vibration ON, layout adaptive).

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION  
**Confidence Level:** High (pending the important clarifications above)

**Key Strengths:**
- Clean client-only architecture with strong offline-first design.
- Deterministic timing engine and clear state model.
- Strong consistency rules to prevent agent conflicts.

**Areas for Future Enhancement:**
- Finalize testing framework selection.
- Document Node version minimum in README.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use implementation patterns consistently across all components.
- Respect project structure and boundaries.
- Refer to this document for all architectural questions.

**First Implementation Priority:**
- Complete `/_bmad-output/planning-artifacts/engineering-setup-checklist.md` before implementation work begins.
