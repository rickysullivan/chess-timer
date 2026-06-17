# Polish Before Ship — Requirements

**Author:** Ricky
**Date:** 2026-06-17
**Status:** Draft

## Problem

The chess-timer MVP is functionally complete, but the current UI doesn't feel like a product worth recommending. The game screen wastes vertical space on a redundant info card, active/inactive timer zones lack visual punch, state transitions are abrupt, the setup screen has a flat hierarchy, and several interactions (reset confirmation, settings drawer, toggle switches) feel unfinished. The PRD targets time-to-first-game under 60 seconds and a "purpose-built" feel — the current experience doesn't deliver on that promise yet.

## Scope

### In Scope

- Game screen: timer surface fills available vertical space; "Active control" info card is removed or collapsed; stronger visual contrast between active/inactive zones; improved paused state; improved game-end state
- Setup screen: tighter visual hierarchy; custom controls section collapses when preset is selected (and vice versa); start button gets more visual weight; header brand refinement
- State transitions: subtle micro-transitions on game start, pause/resume, and turn switch; slide animation on settings drawer; in-app confirmation dialog for reset (replacing `window.confirm`)
- Visual refinement: stronger type hierarchy and spacing throughout; settings toggles upgraded from On/Off text buttons to proper toggle switches; refined active/inactive zone contrast; consistent surface treatment

### Out of Scope

- New features (move counter, session log, shareable presets, dark mode, theming)
- Color palette changes or brand redesign
- New screens or navigation flows
- PWA or offline behavior changes
- Analytics or telemetry changes
- Performance optimization beyond visual transitions
- Accessibility remediation beyond what's incidentally improved by the polish pass

## Requirements

### GS-1: Timer surface fills the viewport

**Context:** Game screen currently dedicates vertical space to a header, "Active control" info card (showing control label + base/increment/delay), timer zone at fixed `h-[18rem]`, and controls. The PRD specifies "timer zones dominate vertical space."

**Requirement:** During active play, the timer zone expands to fill available vertical space between a minimized header and the control bar. The "Active control" card is removed from the game screen — the control label (e.g., "1+0") appears as a compact badge in the header instead. The timer zone uses `flex-grow` or viewport-based sizing rather than a fixed height.

**Does not prescribe:** Specific CSS implementation; whether to use flexbox grid, or viewport units.

### GS-2: Stronger active/inactive zone contrast

**Context:** Current active zone uses `bg-orange-50 border-primary` and inactive uses `bg-white border-slate-200`. The difference is subtle on many screens, especially in bright light.

**Requirement:** The active timer zone has visibly stronger visual emphasis — bolder background fill, stronger border, or both — so the active side is unmistakable at a glance. The inactive zone recedes further. High-contrast mode also gets clearer differentiation.

**Does not prescribe:** Specific color values; whether to use background, border, shadow, or a combination.

### GS-3: Improved paused state

**Context:** Paused state currently shows two side-by-side cards with a resume button and the same layout density. The PRD specifies "clear paused/50/50 view."

**Requirement:** When paused, the layout shifts to a balanced 50/50 view of both timers with a prominent "Resume" action. The paused state visually communicates "paused" at a glance — dimmed or muted zones, a clear paused indicator, and the resume button is easy to find and tap. Both timers remain readable.

### GS-4: Improved game-end state

**Context:** When a player times out, the game currently shows a red "Time Out" badge and a small red text line `"{side} ran out of time."` The end state feels anticlimactic and easy to miss.

**Requirement:** The game-end state is visually decisive — the timed-out zone is clearly marked (dimmed, red accent, or similar), the winning side is apparent, and end-of-game controls (Reset, Back to Setup) are prominent. The end state should feel like a conclusion, not a quiet error message.

### GS-5: "Back to Setup" after game end

**Context:** Currently, the "Back to Setup" button is disabled when `isEnded` is true, which prevents returning to setup after a game ends.

**Requirement:** "Back to Setup" is available after game end. The button is clearly accessible alongside Reset on the game-end screen.

### SU-1: Collapsible control source sections

**Context:** Both the Preset list and Custom control section are visible at all times, making the setup screen tall and requiring scrolling.

**Requirement:** When "Preset" is selected as the control type, the custom control section is hidden. When "Custom" is selected, the preset list is hidden. Only the active control source section is visible. Switching between them is animated with a subtle transition.

### SU-2: Start button visual weight

**Context:** The Start button currently uses the default `Button` component at `size="lg"` with `w-full`. It's functional but doesn't have the visual prominence the PRD's "fast start" goal demands.

**Requirement:** The Start button feels like the primary action — stronger visual weight (larger, more prominent, or higher contrast fill) while remaining clearly tappable. The selected control label in the button text is retained.

### SU-3: Header brand refinement

**Context:** The header uses a generic chip with a `Clock3` icon and "chess-timer" text. It's functional but doesn't feel like a product identity.

**Requirement:** The header brand is refined — cleaner typography, more intentional spacing, consistent with the tool-like aesthetic. The icon can be simplified or replaced if it doesn't serve the brand feel. The header should stay compact but feel intentional.

### TR-1: In-app confirmation dialog

**Context:** Reset currently uses `window.confirm('Reset game and clear undo history?')` — a browser modal that breaks the app feel and visual consistency.

**Requirement:** Replace `window.confirm` with an in-app confirmation dialog component. The dialog uses the app's visual language, has clear "Reset" and "Cancel" actions, and traps focus while open. Pressing Escape or tapping outside dismisses (cancel).

**Does not prescribe:** Whether to build a custom `<ConfirmDialog>` component or use shadcn/ui's `AlertDialog`. The dialog must be accessible (focus trap, ARIA) and visually consistent.

### TR-2: Settings drawer slide animation

**Context:** The settings drawer currently appears instantly with no transition. The PRD specifies "restrained, functional transitions."

**Requirement:** The settings drawer slides in from the bottom with a short, snappy transition (150–250ms ease-out). The backdrop fades in. Closing reverses the animation. This applies to both opening and closing the drawer.

### TR-3: Subtle state micro-transitions

**Context:** Game start, pause/resume, and turn switch currently have no visual transition — state changes are instant and abrupt.

**Requirement:** Key state changes get subtle, functional micro-transitions:

- Game start: brief transition from setup to game screen (not a page navigation, but enough to register the change)
- Pause/resume: timer zones cross-fade or shift between active/paused layouts
- Turn switch: active/inactive zones swap with a brief, snappy transition (100–200ms)

Transitions must respect `prefers-reduced-motion` — when reduced motion is preferred, transitions are suppressed or instantaneous.

### VI-1: Settings toggle switches

**Context:** Settings currently uses On/Off text buttons. These are functional but don't match the toggle switch pattern users expect for boolean settings.

**Requirement:** Replace On/Off text buttons with proper toggle switches (sliding toggle pattern). The switch position and fill indicate on/off state. Toggling is instant with no form submission. Keyboard and screen reader users can operate them via Space or Enter.

### VI-2: Stronger type hierarchy and spacing

**Context:** Section labels, body text, and interactive elements currently have similar visual weight. The PRD specifies "large typography and strong hierarchy" and "minimal, Teenage Engineering-inspired aesthetic."

**Requirement:** Across both screens, establish a clearer type hierarchy:

- Timer digits: larger, bolder, tabular-nums (already partially present, needs tightening)
- Section labels: consistent small-caps uppercase tracking (already present, needs spacing consistency)
- Body/helper text: smaller, muted, clearly subordinate
- Overall: more vertical breathing room between sections, less visual clutter

**Does not prescribe:** Specific rem values or type scale; should be established by eye during implementation.

### VI-3: Consistent surface treatment

**Context:** Cards, sections, and containers use a mix of rounded-xl, rounded-2xl, border-slate-200, shadow-sm without a consistent rhythm. Some elements (preset cards, settings rows) use similar treatments; others (timer zones, action bar) feel different.

**Requirement:** Establish a consistent surface system: primary surfaces (cards, timer zones) get one treatment; secondary surfaces (rows, chips) get a lighter treatment. Border radius, shadow, and padding follow a consistent scale. The result should feel like one system, not a mix of styling approaches.

## Success Criteria

- Game screen: timer surface occupies the majority of vertical space during active play; active side is immediately obvious from >1m away
- Setup screen: visible area shows only the active control type section; start button is the most prominent element on the page
- Reset confirmation uses an in-app dialog, no browser dialogs
- Settings toggles use switch-style controls
- All transitions respect `prefers-reduced-motion`
- No regression in core gameplay: timer accuracy, turn switching, pause/resume, undo, reset all still work correctly
- No regression in accessibility: ARIA labels, focus management, screen reader support maintained

## Dependencies and Assumptions

- No new dependencies required — all changes use existing stack (React, Tailwind, shadcn/ui, Lucide icons)
- Assumes shadcn/ui's `AlertDialog` component is available or can be added
- Assumes shadcn/ui's `Switch` component is available or can be added
- Visual polish is evaluated by eye during implementation, not by pixel-spec comparison
- Reduced-motion support is handled via Tailwind's `motion-reduce:` or CSS `prefers-reduced-motion`

## Open Questions

- None (defaults locked as described above)