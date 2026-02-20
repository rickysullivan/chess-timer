---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# chess-timer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for chess-timer, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.
Engineering setup tasks are tracked in `/_bmad-output/planning-artifacts/engineering-setup-checklist.md`.

## Requirements Inventory

### Functional Requirements

FR1: Users can choose a preset time control.
FR2: Users can create a custom time control with base time, increment, and delay.
FR3: Users can start a game using the selected time control.
FR4: The system can count down the active player's time according to the selected control rules.
FR5: The system can display both player timers with the active side clearly indicated.
FR6: Users can relaunch the app with the last-used control preselected.
FR7: Users can switch turns with a single tap on the active side.
FR8: The system can present either an adaptive hit-surface layout or a classic 50/50 layout during active play.
FR9: The system can flip the active and inactive zones when turns change.
FR10: Users can pause the game by tapping the inactive strip when adaptive layout is active.
FR11: The system can show a balanced 50/50 layout while paused and return to the prior layout on resume.
FR12: Users can pause and resume an active game without losing state.
FR13: Users can reset the game to the initial time control.
FR14: Users can undo the most recent turn switch.
FR15: The system can end a game when a player's time reaches zero.
FR16: Users can toggle sound feedback.
FR17: Users can toggle vibration feedback.
FR18: Users can toggle a keep-screen-awake setting during active play.
FR19: Users can choose adaptive or classic layout mode.
FR20: Users can adjust settings without losing an active game state.
FR21: Users can enable high-contrast mode.
FR22: Users can enable large digits for timers.
FR23: The system can indicate state changes with non-color cues.
FR24: Users can install the app from the browser.
FR25: Users can use the app offline after the first successful load.
FR26: The system can persist settings and the last-used control locally.
FR27: The system can preserve in-progress game state across refresh or backgrounding.
FR28: Users can access the app without creating an account or logging in.
FR29: The system can maintain a usable layout in both portrait and landscape orientations.
FR30: Users can open the app via a shareable URL and start a game without install requirements.
FR31: The system can provide a shareable link for multi-board setups.
FR32: The system can record analytics events for key actions (open, game start, turn switch, pause/resume, reset, undo, install).

### NonFunctional Requirements

NFR1: Tap-to-switch latency median <= 50ms and p95 <= 100ms on mid-tier mobile; measured over 200 taps.
NFR2: Start-to-running after Start tap <= 1s.
NFR3: Timer drift <= 100ms over 10 minutes compared to a reference clock.
NFR4: Missed tap rate <= 1% over 200 taps.
NFR5: Offline flows pass in 100% of smoke tests after first load across supported browsers.
NFR6: Game state resumes correctly after 30 minutes of backgrounding/refresh; timers and active side unchanged.
NFR7: Keep-awake prevents screen dim/lock for at least 20 minutes on supported browsers.
NFR8: WCAG 2.1 AA compliance for contrast and interaction; verified via automated + manual review.
NFR9: Contrast ratio >= 4.5:1 for timer text and active states.
NFR10: Touch targets >= 44px with visible focus on all controls at 360px viewport.
NFR11: Reduced-motion preference disables non-essential animations.
NFR12: No accounts or PII collection; no PII in analytics events.
NFR13: Settings and game state stored locally only; no network persistence on changes.
NFR14: LCP <= 2.5s on mid-tier mobile over 4G (Lighthouse mobile).
NFR15: INP <= 200ms for core timer interactions.
NFR16: CLS <= 0.1 on first load.
NFR17: Repeat visit load <= 2s on mid-tier mobile with warmed cache.
NFR18: App is not indexed; enforce `noindex` and robots.txt restrictions.
NFR19: Supported browsers: iOS Safari and Android Chrome (latest 2), plus desktop Chrome/Edge/Safari/Firefox (latest 2); unsupported browsers show a friendly warning and continue with degraded features.
NFR20: Mobile-first responsive layout with safe-area insets and controls reachable at 360px width; no clipping in portrait/landscape.

### Additional Requirements

- Starter template: Vite PWA React TS using `npm create @vite-pwa/pwa@latest chess-timer -- --template react-ts`.
- PWA caching strategy: network-first for HTML/app shell; cache-first for static assets; offline fallback to cached shell.
- Client-only app (no backend API); state and settings persist locally only (localStorage).
- Persistence keys use `chess_timer.*` prefix; restore in-progress game only if lastUpdated <= 30 minutes, otherwise start fresh with last-used control.
- Timer engine uses high-resolution monotonic time (performance.now) and requestAnimationFrame update loop; pause and persist on visibility change/backgrounding.
- State management via single Zustand store with slices; immutable updates; time units in milliseconds internally and converted only for display.
- Analytics via PostHog and error tracking via Sentry; event names/properties in snake_case and include `session_id` and `layout_mode` on core events.
- Hosting on Cloudflare Pages with GitHub Actions CI/CD; build-time env config only.
- UI defaults on first launch: sound ON, vibration ON, layout mode adaptive.
- MVP preset list: 1+0, 3+2, 5+0, 10+0, 15+10, 30+0.
- Adaptive 80/20 layout is default with classic 50/50 toggle; inactive strip tap pauses; paused state expands to 50/50.
- Provide a lightweight onboarding cue for adaptive layout and pause gesture.
- Wake Lock integration with non-blocking banner when unsupported.
- Rotate one player's timer digits 180 degrees for opposite-seating readability while keeping controls upright.
- Visual direction: neutral base palette with single accent `#EC7B43`, large tabular digits, minimal chrome.
- Settings must be accessible without leaving active play; changes apply instantly and preserve game state.
- Invalid custom control inputs (negative values, zero base) show inline validation and block Start.
- Status strip/banners used for offline and wake lock messaging (non-blocking, role="status").

### FR Coverage Map

FR1: Epic 1 - Preset selection (Story 1.1)
FR2: Epic 1 - Custom controls (Story 1.2)
FR3: Epic 1 - Start game (Story 1.3)
FR4: Epic 2 - Timer countdown
FR5: Epic 2 - Dual timers + active state
FR6: Epic 5 - Last-used control preselected (Story 5.5)
FR7: Epic 2 - Single-tap switch
FR8: Epic 2 - Adaptive vs classic layout
FR9: Epic 2 - Flip zones on turn change
FR10: Epic 2 - Pause via inactive strip
FR11: Epic 2 - 50/50 layout while paused
FR12: Epic 3 - Pause/resume
FR13: Epic 3 - Reset
FR14: Epic 3 - Undo
FR15: Epic 2 - End game at zero
FR16: Epic 4 - Sound toggle
FR17: Epic 4 - Vibration toggle
FR18: Epic 4 - Keep-awake
FR19: Epic 4 - Layout mode preference
FR20: Epic 4 - Settings without losing game state
FR21: Epic 4 - High contrast
FR22: Epic 4 - Large digits
FR23: Epic 4 - Non-color cues
FR24: Epic 5 - Install from browser (Story 5.1)
FR25: Epic 5 - Offline after first load (Story 5.2)
FR26: Epic 5 - Persist settings/last-used
FR27: Epic 3 - Preserve in-progress state
FR28: Epic 5 - No account required
FR29: Epic 2 - Portrait/landscape support
FR30: Epic 5 - Shareable URL access
FR31: Epic 5 - Provide share link
FR32: Epic 5 - Reliability telemetry and error reporting (Story 5.6)

## Epic List

### Epic 1: Fast Setup & Time Control
Start a game quickly with presets or custom controls.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Accurate Live Play & Turn Switching
Play with precise timers, clear active state, and adaptive/classic layouts that work in any orientation.
**FRs covered:** FR4, FR5, FR7, FR8, FR9, FR10, FR11, FR15, FR29

### Epic 3: Control & Recovery During Play
Pause, resume, reset, undo, and preserve game state across interruptions.
**FRs covered:** FR12, FR13, FR14, FR27

### Epic 4: Preferences & Accessibility
Customize feedback, layout, keep-awake, and accessibility without losing game context.
**FRs covered:** FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23

### Epic 5: Access Anywhere (Install, Offline, Share)
Install and run offline with local persistence, shareable access, and reliability telemetry.
**FRs covered:** FR6, FR24, FR25, FR26, FR28, FR30, FR31, FR32

## Epic 1: Fast Setup & Time Control

Start a game quickly with presets or custom controls.

Prerequisite setup tasks (starter init, CI/CD, env, Node baseline, shadcn/Tailwind) are tracked in `/_bmad-output/planning-artifacts/engineering-setup-checklist.md` and are not user stories.

### Story 1.1: Preset List and Selection

As a player,
I want to see and select a preset time control,
So that I can start a game quickly.

**FRs:** FR1

**Acceptance Criteria:**

**Given** the landing screen loads
**When** the preset list is displayed
**Then** the MVP presets appear (1+0, 3+2, 5+0, 10+0, 15+10, 30+0)
**And** exactly one preset can be selected with an accent outline and check icon
**And** the selected item sets `aria-selected=true`

### Story 1.2: Custom Time Control Creation

As a player,
I want to create a custom time control with base, increment, and delay,
So that the timer matches our game format.

**FRs:** FR2

**Acceptance Criteria:**

**Given** the custom control form is open
**When** I enter base minutes, increment seconds, and delay seconds
**Then** the inputs are validated (base > 0, increment/delay >= 0)
**And** invalid inputs show inline errors and prevent Start

### Story 1.3: Start Game From Selected Control

As a player,
I want to start a game using the selected control,
So that the timer view is ready for play.

**FRs:** FR3

**Acceptance Criteria:**

**Given** a preset or custom control is selected and valid
**When** I tap Start
**Then** the game state initializes with the selected control
**And** the timer view appears within 1 second with the active side indicated

**Given** no valid control is selected
**When** I view the Start action
**Then** Start is disabled or blocked with a clear inline message


## Epic 2: Accurate Live Play & Turn Switching

Play with precise timers, clear active state, and adaptive/classic layouts that work in any orientation.

### Story 2.1: Accurate Countdown and Game End

As a player,
I want the active timer to count down accurately,
So that the game is fair and reliable.

**FRs:** FR4, FR15

**Acceptance Criteria:**

**Given** a game is running
**When** time elapses on the active side
**Then** only the active timer decreases based on the selected control rules
**And** the timer drift is <= 100ms over 10 minutes in controlled testing

**Given** the active timer reaches zero
**When** time expires
**Then** the game transitions to an ended state with an "Time Out" label and the expired side dimmed
**And** only Reset is available (tap zones disabled)

### Story 2.2: Single-Tap Turn Switching

As a player,
I want to switch turns with a single tap on the active side,
So that play stays fast and fluid.

**FRs:** FR7, FR9

**Acceptance Criteria:**

**Given** a game is running
**When** I tap the active side
**Then** the active player switches within 50ms median response time
**And** the active/inactive zones flip to reflect the new turn

**Given** a game is running
**When** I tap the inactive strip
**Then** the turn does not switch (pause behavior is handled separately)

### Story 2.3: Adaptive and Classic Layout Modes

As a player,
I want to use either adaptive 80/20 or classic 50/50 layout during play,
So that the timer fits my preference and accuracy needs.

**FRs:** FR5, FR8

**Acceptance Criteria:**

**Given** layout mode is set to adaptive
**When** a game is running
**Then** the active side uses a dominant tap zone with a smaller inactive strip
**And** the active side shows an "Active" label plus accent band with >= 4.5:1 contrast

**Given** this is the first session
**When** the adaptive layout is shown
**Then** a cue appears once per session with text "Tap big area to switch. Tap thin strip to pause."
**And** the cue auto-dismisses within 3 seconds or via a close icon
**And** the cue does not block taps

**Given** layout mode is set to classic
**When** a game is running
**Then** both sides render in a balanced 50/50 split

### Story 2.4: Pause via Inactive Strip and Paused View

As a player,
I want to pause by tapping the inactive strip and see a balanced paused view,
So that interruptions are handled clearly.

**FRs:** FR10, FR11

**Acceptance Criteria:**

**Given** adaptive layout is active and the game is running
**When** I tap the inactive strip
**Then** the game pauses and both timers are shown in a balanced 50/50 view
**And** resuming returns to the prior layout and active side

### Story 2.5: Orientation-Safe Layout and Readability

As a player,
I want the timer to remain usable in portrait and landscape,
So that the phone can sit between players in any orientation.

**FRs:** FR29

**Acceptance Criteria:**

**Given** a game is running
**When** the device orientation changes
**Then** timers, tap zones, and controls remain visible without clipping
**And** one player's timer digits are rotated 180 degrees while controls remain upright

## Epic 3: Control & Recovery During Play

Pause, resume, reset, undo, and preserve game state across interruptions.

### Story 3.1: Pause and Resume Controls

As a player,
I want a clear pause/resume control during play,
So that I can stop and continue without losing time.

**FRs:** FR12

**Acceptance Criteria:**

**Given** a game is running
**When** I tap Pause
**Then** both timers stop immediately and the paused state is visible
**And** tapping Resume continues from the exact prior values

### Story 3.2: Undo Last Turn Switch

As a player,
I want to undo the most recent turn switch,
So that accidental taps do not ruin the game.

**FRs:** FR14

**Acceptance Criteria:**

**Given** at least one turn switch has occurred
**When** I tap Undo
**Then** the previous active side and time values are restored
**And** Undo is disabled when there is no switch to undo

### Story 3.3: Reset Game to Initial Control

As a player,
I want to reset the game to the initial control,
So that we can restart cleanly.

**FRs:** FR13

**Acceptance Criteria:**

**Given** a game is running or paused
**When** I confirm Reset
**Then** both timers return to the initial control values and the game state resets
**And** the turn history is cleared

### Story 3.4: Persist and Restore In-Progress State

As a player,
I want the game state preserved across refresh or backgrounding,
So that I can continue without losing progress.

**FRs:** FR27

**Acceptance Criteria:**

**Given** a game is active
**When** the app is backgrounded or refreshed
**Then** the game state is saved locally with a last-updated timestamp
**And** on reopen within 30 minutes the game restores to the exact state

## Epic 4: Preferences & Accessibility

Customize feedback, layout, keep-awake, and accessibility without losing game context.

### Story 4.1: Settings Access Without Losing Game State

As a player,
I want to open settings without leaving the game,
So that I can adjust preferences without losing my place.

**FRs:** FR20

**Acceptance Criteria:**

**Given** a game is running or paused
**When** I open and close settings
**Then** the game state remains intact and timers are unchanged
**And** settings open in a bottom sheet/drawer and apply changes immediately

### Story 4.2: Sound and Vibration Toggles

As a player,
I want to toggle sound and vibration feedback,
So that feedback matches my preference.

**FRs:** FR16, FR17

**Acceptance Criteria:**

**Given** the app is opened for the first time
**When** I view settings
**Then** sound and vibration are ON by default
**And** toggling either option immediately affects turn switch and pause feedback

### Story 4.3: Keep-Screen-Awake Setting

As a player,
I want to keep the screen awake during play,
So that the device does not dim or lock mid-game.

**FRs:** FR18

**Acceptance Criteria:**

**Given** keep-awake is enabled
**When** the game is running
**Then** a Wake Lock request is made and held while supported
**And** if unsupported, a non-blocking banner warns the user

### Story 4.4: Layout Mode Preference

As a player,
I want to choose adaptive or classic layout mode,
So that the timer fits my play style.

**FRs:** FR19

**Acceptance Criteria:**

**Given** layout mode is changed in settings
**When** I return to the game
**Then** the selected layout renders immediately
**And** the preference persists across app restarts

**Given** a game is running
**When** layout mode is toggled
**Then** timers and active side remain unchanged

### Story 4.5: Accessibility Modes and Non-Color Cues

As a player,
I want high-contrast, large digits, and non-color state cues,
So that the timer is easy to read and understand.

**FRs:** FR21, FR22, FR23

**Acceptance Criteria:**

**Given** high-contrast or large digits are enabled
**When** I view the timer
**Then** the timer digits and active state meet contrast requirements and are visibly larger
**And** active/paused/ended states are indicated by more than color alone

## Epic 5: Access Anywhere (Install, Offline, Share)

Install and run offline with local persistence and shareable access.

### Story 5.1: Installable PWA Experience

As a player,
I want to install the app from the browser,
So that it behaves like a native tool.

**FRs:** FR24

**Acceptance Criteria:**

**Given** the app is opened in a supported browser
**When** I choose to install
**Then** a valid manifest and service worker allow installation
**And** the app launches from the home screen without browser chrome

### Story 5.2: Offline-First Launch and Play

As a player,
I want the app to work offline after the first load,
So that I can play anywhere.

**FRs:** FR25

**Acceptance Criteria:**

**Given** the app has been loaded once online
**When** I go offline and relaunch
**Then** the app shell loads from cache and I can start a game
**And** the caching strategy uses network-first for HTML and cache-first for assets
**And** unsupported browsers show a non-blocking "Limited support" banner with a dismiss action and role="status"
**And** Start remains enabled

### Story 5.3: Local-Only Persistence and No Account

As a player,
I want my settings and last-used control saved locally without an account,
So that I can return quickly without creating a login.

**FRs:** FR26, FR28

**Acceptance Criteria:**

**Given** I change settings or start a game
**When** the app saves state
**Then** data is stored locally using the `chess_timer.*` key prefix
**And** no account creation or PII fields are required

### Story 5.4: Shareable Access and Link Sharing

As a player,
I want to open the app via a shareable link and share it with others,
So that multiple boards can start quickly.

**FRs:** FR30, FR31

**Acceptance Criteria:**

**Given** I am on the landing screen
**When** I select Share
**Then** a shareable link is provided for copying or native share
**And** opening that link starts the app without requiring installation

### Story 5.5: Last-Used Control Preselected on Return

As a returning player,
I want the last-used control preselected when I relaunch the app,
So that I can restart quickly.

**FRs:** FR6

**Acceptance Criteria:**

**Given** I previously started a game
**When** I reopen the app
**Then** the last-used control is preselected and its values are loaded
**And** I can start immediately without re-entering settings

### Story 5.6: Reliability Telemetry and Error Reporting

As a player,
I want the app to capture reliability signals and errors,
So that issues can be detected and fixed quickly and the timer stays trustworthy.

**FRs:** FR32

**Acceptance Criteria:**

**Given** the app is in use
**When** users perform core actions
**Then** analytics events are captured for open, game start, turn switch, pause/resume, reset, undo, and install
**And** event names/properties use snake_case and include `session_id` and `layout_mode` without PII

**Given** a runtime error occurs
**When** the app captures the exception
**Then** the error is reported to the tracking service with app state and route context
**And** error reporting does not block gameplay flows
