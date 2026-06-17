---
title: Polish Before Ship
type: feat
created: 2026-06-17
updated: 2026-06-17
origin: docs/brainstorms/polish-requirements.md
status: active
---

# Polish Before Ship

## Problem

The chess-timer MVP is functionally complete but doesn't feel ship-quality. The game screen wastes vertical space on a redundant info card, timer zones lack visual punch, state changes are abrupt, the setup screen has flat hierarchy, and several interactions (reset confirmation, settings drawer, toggle switches) feel unfinished. The PRD targets time-to-first-game under 60 seconds and a "purpose-built" feel — the current UI doesn't deliver on that promise yet.

## Scope

### In Scope

All 12 requirements from the origin document:
- **GS-1 through GS-5**: Game screen layout, zone contrast, paused/end states, Back to Setup fix
- **SU-1 through SU-3**: Setup screen collapsible sections, start button, header
- **TR-1 through TR-3**: In-app confirm dialog, settings drawer slide, micro-transitions
- **VI-1 through VI-3**: Toggle switches, type hierarchy/spacing, surface consistency

Plus prerequisite work: migrating from shadcn/ui to HeroUI v3 (including Tailwind v3 to v4), which unblocks AlertDialog, Switch, and Drawer components and sets up the React Native path.

### Out of Scope

New features (move counter, session log, shareable presets, dark mode, theming), PWA/offline behavior changes, analytics/telemetry changes, performance optimization beyond transitions, accessibility remediation beyond what's incidentally improved.

### Deferred to Follow-Up

- PWA icon set (currently placeholder SVG)
- Dark mode implementation (HeroUI v3 supports it via data-theme — ready to add when wanted)
- Component/integration test infrastructure (only store tests exist today)
- Service Worker caching strategy (`vite-plugin-pwa` has no `workbox` config)

## Key Technical Decisions

1. **Migrate to HeroUI v3 for UI components** — HeroUI v3 provides AlertDialog (TR-1), Switch (VI-1), and Drawer (TR-2) as built-in components with accessibility, animations, and compound patterns. This replaces the current shadcn/ui Button and hand-built drawer. HeroUI also has a Native counterpart (`@heroui/native`) for the future iOS App Store deployment, making this a future-proof foundation. The migration includes: removing shadcn/ui, installing `@heroui/react` and `@heroui/styles`, migrating Tailwind v3 to v4 (HeroUI v3 requires v4), and rewriting Button using HeroUI's compound pattern.

2. **Use HeroUI's built-in animation system** — HeroUI v3 components use `data-entering`/`data-exiting` attributes for enter/exit animations. The Drawer component slides in/out automatically. The AlertDialog fades/zooms. Micro-transitions on game state changes use HeroUI's animation utilities in Tailwind v4. No additional animation library needed.

3. **Keep current slate+orange palette** — Per the brainstorm decision, refine the existing palette usage rather than changing colors. HeroUI uses oklch CSS variables via its theme system; we override `--accent` to our orange (`oklch(0.7 0.15 50)`) and map the rest to the existing slate palette. The theme tokens will live in `src/index.css` alongside HeroUI's `@heroui/styles` import.

4. **Timer surface uses flex-grow, not viewport units** — The game screen timer zone fills available space between a compact header and the control bar. `flex-grow` with `min-h` constraints gives better results than `vh` calculations across browsers and orientations.

5. **Collapsible sections via conditional rendering** — SU-1 hides the inactive control source section entirely rather than animating height. This keeps the setup screen compact without a complex layout animation library. A subtle fade/slide can be added in U6.

6. **Respect `prefers-reduced-motion`** — HeroUI respects `prefers-reduced-motion` by default. Custom transitions also use `motion-reduce:` or `data-[reduced-motion]` to suppress animations.

7. **Tailwind v4 migration strategy** — HeroUI v3 requires Tailwind CSS v4. Migrate by: updating `tailwind.config.js` to `tailwind.config.ts` (v4 convention, or using CSS-based config), replacing the v3 `@tailwind` directives with v4 `@import "tailwindcss"`, and updating `@heroui/styles` imports. The v4 migration changes how theme tokens are defined (CSS `@theme` blocks instead of JS config) but the utility classes are largely compatible.

## Implementation Units

### U1. Migrate to HeroUI v3 and Tailwind v4

**Goal:** Replace shadcn/ui with HeroUI v3 as the component foundation. Migrate Tailwind from v3 to v4 (required by HeroUI v3). This unblocks all subsequent UI polish units and establishes the foundation for future React Native porting.

**Requirements:** Pervasive prerequisite — enables TR-1, TR-2, VI-1, and all subsequent units.

**Dependencies:** None.

**Files:**
- `package.json` (modify — remove shadcn deps, add HeroUI and Tailwind v4 deps)
- `src/components/ui/button.tsx` (rewrite — HeroUI Button compound pattern)
- `src/index.css` (modify — Tailwind v4 directives, HeroUI theme import, custom theme overrides)
- `tailwind.config.js` (modify or replace — Tailwind v4 CSS-based config or updated JS config)
- `postcss.config.js` (modify — Tailwind v4 PostCSS plugin)
- `vite.config.ts` (modify — may need Tailwind v4 plugin update)
- `src/lib/utils.ts` (modify — add HeroUI cn utility or keep existing)
- `components.json` (remove — no longer needed)
- `src/App.tsx` (modify — update Button imports)
- `src/features/setup/components/SetupScreen.tsx` (modify — update Button imports)
- `src/features/gameplay/components/GameScreen.tsx` (modify — update Button imports)
- `src/features/settings/components/SettingsDrawer.tsx` (modify — update Button imports)

**Approach:**

1. **Install HeroUI and migrate Tailwind:**
   - `npm uninstall class-variance-authority tailwindcss-animate`
   - `npm install @heroui/react @heroui/styles tailwindcss@^4 @tailwindcss/vite`
   - Update `vite.config.ts` to use `@tailwindcss/vite` plugin instead of `postcss`
   - Replace `tailwind.config.js` with Tailwind v4 CSS-based configuration in `src/index.css` using `@import "tailwindcss"` and `@import "@heroui/styles"`
   - Move theme color overrides into HeroUI's CSS variable system (oklch format)
   - Update `postcss.config.js` if needed for v4

2. **Rewrite Button component:**
   - Replace `src/components/ui/button.tsx` with HeroUI's `Button` compound component pattern: `<Button>`, `<Button variant="primary">`, `<Button variant="outline">`, etc.
   - HeroUI Button uses `onPress` instead of `onClick` (React Aria convention)
   - Update all usages in App.tsx, SetupScreen.tsx, GameScreen.tsx, SettingsDrawer.tsx
   - Remove `components.json` (shadcn config no longer needed)
   - Remove `src/lib/utils.ts` cn function if HeroUI's utilities replace it (HeroUI components accept `className` prop)

3. **Set up theme:**
   - In `src/index.css`, import HeroUI styles and override the accent color to match the existing orange (`oklch(0.7 0.15 50)` approximately)
   - Map `--background`, `--foreground`, `--border`, `--muted` etc. to the existing slate palette in oklch
   - Ensure the app renders correctly with HeroUI's default theme before proceeding

4. **Verify no regressions:**
   - The app must render identically to before the migration
   - All existing functionality (game flow, settings, persistence) must work
   - The Button component must look and behave the same as before

**Patterns to follow:** HeroUI v3 compound component pattern (`<Button variant="primary">`, `<Button variant="outline">`). HeroUI theme system uses CSS variables with oklch format. HeroUI uses `onPress` instead of `onClick` for interactive elements.

**Test scenarios:**
- App renders without build errors after migration
- Button components render with same visual appearance as before (primary and outline variants)
- All onClick handlers still work (HeroUI `onPress` is interop-compatible with click)
- Theme colors match the existing slate+orange palette
- PWA manifest and service worker still function

**Verification:** `npm run build` passes. `npm run lint` passes. `npm run test:run` passes. Visual spot-check that the app looks identical to before migration — no layout shifts, no color changes, no broken interactions.

---

### U2. Game screen overhaul

**Goal:** Make the timer surface dominate vertical space, improve active/inactive zone contrast, fix paused and game-end states, enable Back to Setup after game end, replace the "Active control" card with a compact header badge, replace `window.confirm()` with HeroUI AlertDialog.

**Requirements:** GS-1, GS-2, GS-3, GS-4, GS-5, TR-1 (partial).

**Dependencies:** U1 (HeroUI migration complete, AlertDialog available).

**Files:**
- `src/features/gameplay/components/GameScreen.tsx` (modify)

**Approach:**

- **GS-1 (timer fills viewport):** Remove the "Active control" section card entirely. Move the control label (e.g., "1+0") to the header brand area as a compact badge. Change the timer zone from fixed `h-[18rem]` to a flex-grow layout that fills the space between header and controls. The section containing timers becomes `flex-1` with the timer group inside getting `flex-1 min-h-0`.

- **GS-2 (stronger zone contrast):** Active zone gets visually stronger emphasis — a saturated fill using HeroUI theme tokens (`bg-accent-soft` or explicit orange fills), larger border or accent bar. Inactive zone recedes with `bg-surface-secondary` or similar muted fill. Increase the visual weight gap between active and inactive. High-contrast mode gets clearer differentiation too.

- **GS-3 (improved paused state):** When paused, the layout shifts to balanced 50/50 with clear paused styling — muted/dimmed backgrounds, a "Paused" indicator, and a prominent Resume button using HeroUI `<Button variant="primary">`. The paused state should communicate "deliberately interrupted."

- **GS-4 (improved game-end state):** When a player times out: the losing side's zone dims or gets a danger/success accent; the winning side is apparent; end-of-game controls (Reset, Back to Setup) are visually prominent. Replace the small red text line with a more decisive end-state treatment using HeroUI's `--danger` color token.

- **GS-5 (Back to Setup after game end):** Remove the `disabled={isEnded}` condition from the "Back to Setup" button. It should always be available.

- **Reset confirmation (TR-1):** Replace `window.confirm()` with HeroUI `<AlertDialog>`. Use compound pattern: `<AlertDialog.Backdrop>`, `<AlertDialog.Container>`, `<AlertDialog.Dialog>` with `<AlertDialog.Icon status="danger">`, `<AlertDialog.Heading>`, `<AlertDialog.Body>`, `<AlertDialog.Footer>` containing Cancel and Reset `<Button>` elements. The dialog uses `isOpen` and `onOpenChange` for controlled state. `isDismissable={true}` allows backdrop click to cancel. Escape closes by default.

**Patterns to follow:** HeroUI AlertDialog compound pattern (see docs: `<AlertDialog>`, `<AlertDialog.Backdrop>`, `<AlertDialog.Container>`, etc.). HeroUI `<Button>` instead of shadcn Button. `cn()` for conditional class merging where needed.

**Test scenarios:**
- Game starts and timer surface fills viewport vertically (no scroll, no fixed height)
- Active zone is visually dominant; inactive zone recedes; difference is clearer in high-contrast mode
- Paused state shows 50/50 with clear Resume action
- Game end shows decisive end state with prominent Reset and Back to Setup
- Back to Setup is clickable when game has ended
- Reset opens HeroUI AlertDialog instead of window.confirm; Escape and Cancel dismiss it; Reset action resets the game
- Control label appears in header as a compact badge, not as a separate card

**Verification:** Visual walkthrough of all game states (active, paused, resumed, ended) on desktop and narrow mobile viewport. All game controls (pause, resume, undo, reset, back to setup) still function correctly. Store timing logic unchanged.

---

### U3. Settings drawer upgrade

**Goal:** Replace the hand-built settings drawer with HeroUI Drawer (slide animation from bottom), replace On/Off text buttons with HeroUI Switch toggles.

**Requirements:** TR-2, VI-1.

**Dependencies:** U1 (HeroUI migration complete, Drawer and Switch available).

**Files:**
- `src/features/settings/components/SettingsDrawer.tsx` (modify)

**Approach:**

- **TR-2 (slide animation):** Replace the current conditional render and backdrop `<button>` with HeroUI's `<Drawer>` compound component. Use `<Drawer>`, `<Drawer.Backdrop>`, `<Drawer.Container>`, `<Drawer.Content>` with bottom placement. The Drawer component provides built-in slide animation, backdrop, focus trap, and Escape key handling. Remove the manual `useEffect` for focus management and Escape key handling — Drawer handles these natively via React Aria.

- **VI-1 (toggle switches):** Replace each `SettingToggle` (On/Off text button) with HeroUI `<Switch>` compound pattern: `<Switch>`, `<Switch.Content>`, `<Switch.Control>`, `<Switch.Thumb>`. The Switch component provides `isSelected`/`onChange` props, `aria-checked` accessibility, and proper toggle semantics. Keep the row styling (border, padding, label) but swap the button element for the Switch compound pattern.

- Maintain all existing settings functionality: sound, vibration, keep-screen-awake, high-contrast, large-digits, layout mode.

- The layout mode selector (Adaptive/Classic) stays as a button group using HeroUI `<Button>` with `variant="secondary"` or `aria-pressed` styling, unchanged.

**Patterns to follow:** HeroUI Drawer compound pattern (`<Drawer>`, `<Drawer.Backdrop>`, etc.). HeroUI Switch compound pattern (`<Switch>`, `<Switch.Content>`, `<Switch.Control>`, `<Switch.Thumb>`).

**Test scenarios:**
- Settings drawer slides in from bottom with animation
- Drawer has backdrop that closes on tap
- Escape key closes the drawer
- Focus is trapped in the drawer while open
- All 5 toggles work as Switch components (sound, vibration, keep-screen-awake, high-contrast, large-digits)
- Layout mode toggle still works as button group
- Settings changes persist to localStorage and take effect immediately
- Drawer closes and returns focus to the settings button
- Reduced-motion preference suppresses slide animation

**Verification:** Open settings drawer, verify slide animation, toggle each setting, close via backdrop/Escape/button. Verify all settings persist across page reload.

---

### U4. Setup screen polish

**Goal:** Collapsible control sections (show only preset or custom, not both), stronger start button, refined header.

**Requirements:** SU-1, SU-2, SU-3.

**Dependencies:** U1 (HeroUI migration complete, Button available).

**Files:**
- `src/features/setup/components/SetupScreen.tsx` (modify)

**Approach:**

- **SU-1 (collapsible sections):** When `controlSource === 'preset'`, hide the custom control section entirely. When `controlSource === 'custom'`, hide the presets section entirely. Use conditional rendering with a subtle `animate-in` fade (added in U6). The "Control type" toggle group stays visible regardless.

- **SU-2 (start button visual weight):** Increase the visual prominence of the Start button using HeroUI `<Button>` styling — larger size variant, or explicit padding/shadow classes. The button text pattern "Start {control.label}" is good — keep it.

- **SU-3 (header refinement):** Tighten the header brand chip: remove the `Clock3` icon (it adds visual noise without value), refine spacing, and ensure the chip feels intentional. If the timer label moves here from GS-1, integrate it cleanly.

**Patterns to follow:** HeroUI `<Button>` for start button and toggle group buttons. Existing conditional class rendering for show/hide.

**Test scenarios:**
- Preset selected: only presets section visible, custom section hidden
- Custom selected: only custom section visible, presets section hidden
- Switching between preset/custom: section appears/disappears cleanly
- Start button is visually prominent and clearly the primary action
- Start button text shows selected control label
- Header brand is clean and compact

**Verification:** Visual walkthrough of setup screen in both preset and custom modes. Start button is immediately identifiable. No scroll needed on standard mobile viewport to see the start button.

---

### U5. Micro-transitions and motion

**Goal:** Add subtle, functional micro-transitions for key state changes. All transitions respect `prefers-reduced-motion`.

**Requirements:** TR-3.

**Dependencies:** U2, U3, U4 (transitions apply to the polished layouts).

**Files:**
- `src/features/gameplay/components/GameScreen.tsx` (modify)
- `src/features/setup/components/SetupScreen.tsx` (modify)

**Approach:**

- **Game start transition:** When transitioning from setup to game screen, apply a brief fade-in on the game screen content. Duration: 150-200ms. Currently the switch is instant (conditional render based on `phase`).

- **Pause/resume transition:** When the timer zone switches between active/paused layouts, apply a fade-in on the incoming state. Use `key` prop or conditional rendering to trigger the animation on state change. Duration: 150ms.

- **Turn switch transition:** When active/inactive zones swap, apply a brief fade on the newly active zone. Duration: 100-150ms. Keep it fast — this fires multiple times per game.

- **Section show/hide transitions:** For SU-1's collapsible sections, apply a fade-in when a section appears. Duration: 150ms.

- **Reduced motion:** HeroUI components respect `prefers-reduced-motion` by default. Custom transitions use `motion-reduce:` Tailwind variant or `data-[reduced-motion]` to suppress animations.

- **Drawer animation:** Already handled by HeroUI Drawer component in U3. No additional work needed.

**Execution note:** Use Tailwind v4 animation utilities and HeroUI's `data-entering`/`data-exiting` attributes where applicable. For simple fade-ins on conditional renders, use `animate-in fade-in duration-150` classes.

**Patterns to follow:** HeroUI component animation patterns (Drawer, AlertDialog use `data-entering`/`data-exiting`). Tailwind v4 animation utilities.

**Test scenarios:**
- Game start: brief fade-in when entering game screen
- Pause: timer zone transitions to paused layout with fade
- Resume: timer zone transitions back to active with fade
- Turn switch: newly active zone has brief fade
- Section toggle on setup: hidden section fades in
- Reduced motion: all animations are suppressed when OS preference is set

**Verification:** Visual walkthrough of all transitions. Set `prefers-reduced-motion: reduce` in browser DevTools and verify all animations are suppressed.

---

### U6. Visual consistency pass

**Goal:** Tighten type hierarchy, spacing, and surface treatment across both screens for a cohesive, tool-like feel. Leverage HeroUI theme tokens for consistent styling.

**Requirements:** VI-2, VI-3.

**Dependencies:** U2, U3, U4 (apply refinements to the polished layouts).

**Files:**
- `src/features/gameplay/components/GameScreen.tsx` (modify)
- `src/features/setup/components/SetupScreen.tsx` (modify)
- `src/features/settings/components/SettingsDrawer.tsx` (modify)
- `src/index.css` (modify — finalize HeroUI theme token overrides)

**Approach:**

- **VI-2 (type hierarchy and spacing):** Establish a consistent type scale:
  - Timer digits: ensure large, legible sizing for active timer, tighter sizing for inactive
  - Section labels: consistent small-caps uppercase tracking pattern, add more vertical spacing between sections
  - Body/helper text: smaller, muted, clearly subordinate
  - Overall: more vertical breathing room between sections, less visual clutter
  - Review all instances and ensure hierarchy reads: digits > labels > helpers

- **VI-3 (surface consistency):** Leverage HeroUI theme tokens for a consistent surface system:
  - Primary surfaces (cards, timer zones): use HeroUI `bg-surface shadow-surface` tokens with consistent `rounded-2xl` border radius
  - Secondary surfaces (rows, chips, toggle groups): use HeroUI `bg-surface-secondary` tokens with `rounded-xl`
  - Active/selected state: use HeroUI `bg-accent-soft text-accent-soft-foreground` tokens, standardize across preset selector, toggle groups, and timer zones
  - Danger/destructive state: use HeroUI `bg-danger-soft text-danger-soft-foreground` tokens for game-end states and reset confirmation
  - Review both screens end-to-end and fix any spacing or surface inconsistencies. This is a polish pass — adjust by eye rather than pixel-spec.

**Patterns to follow:** HeroUI theme token system (`bg-surface`, `bg-accent-soft`, `text-danger-soft-foreground`, etc.). HeroUI BEM classes for component-level customization (`.button`, `.button--primary`, etc.).

**Test scenarios:**
- No visual regression on either screen
- All surfaces follow the HeroUI token system consistently
- Active states use consistent accent token across all components
- Game-end state uses danger token from theme
- Spacing between sections is generous and consistent

**Verification:** Side-by-side visual review of setup and game screens. Confirm visual hierarchy reads clearly at arm's length (timer digits > labels > helpers). Confirm surface treatment is consistent within each category.

---

## System-Wide Impact

- **Tailwind v3 to v4 migration:** All utility classes must be verified. Most are compatible, but `@tailwind` directives and the config format change.
- **Component system change:** All shadcn/ui components are replaced with HeroUI v3 compound components. The `onClick` → `onPress` convention change affects Button and any interactive element.
- **No store changes:** The Zustand store (`src/app/store.ts`) is not modified. Game logic, timing, and state management remain unchanged.
- **No PWA changes:** Service worker, manifest, and install behavior are unaffected.
- **No routing changes:** Single-page app with no router changes.
- **Analytics:** Event capture calls in `App.tsx` are not modified. No new events added.

## Risks

| Risk | Mitigation |
|------|------------|
| Tailwind v4 migration breaks existing styles | v4 is largely compatible with v3 utility classes. Migrate incrementally — first get HeroUI rendering, then fix any broken styles. The main changes are config format and `@import` directives. |
| HeroUI Drawer conflicts with existing focus management | Drawer provides its own focus trap and Escape handling via React Aria. Remove all manual focus management when replacing. |
| `onClick` → `onPress` migration misses instances | Grep for all `onClick` usage on HeroUI components. HeroUI `onPress` is interop-compatible (fires on click, touch, and keyboard), but React Aria recommends `onPress` for proper accessibility. |
| Micro-transitions cause visual jank on low-end mobile | Keep durations short (100-200ms). HeroUI `prefers-reduced-motion` support suppresses animations by default. Profile on mid-tier device. |
| AlertDialog styling conflicts with game state | AlertDialog is only used for destructive reset. Verify it renders correctly on top of the game screen (HeroUI uses portals by default). |
| Collapsible sections create a jarring layout shift | Use HeroUI animation utilities for fade-in when sections appear. |

## Deferred Questions

- Exact color values for active/inactive zone contrast and game-end state — to be determined by eye during U2 implementation
- Whether the header brand chip should include the active control label badge during gameplay (depends on how GS-1's removal of the "Active control" card is resolved) — resolved during U2