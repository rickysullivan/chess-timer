# Zugzwang product audit — 2026-07-22

Scope: first-use setup, starting a 1+0 game, passing the turn, opening settings, and opening custom time controls in the running local app.

## Overall verdict

The main path is compact and understandable, with strong contrast between the active and inactive clocks. The highest-value improvements are to make live-game controls and state changes more explicit, keep custom setup validation and the primary action visible together, and clarify how a player pauses or exits without relying on small helper text.

## Captured flow

1. **Setup screen — healthy**
   - Evidence: `01-setup.png`
   - Presets are scannable and the selected 1+0 state is obvious. The Start action is prominent.
   - Risk: “Start” is generic in isolation; the accessible name carries the selected time control, but the visible label does not. A visible “Start 1+0 game” label would reduce confirmation effort.

2. **Live game begins — needs polish**
   - Evidence: `02-live-game.png`
   - The active player is visually distinguished and the tap-to-pass instruction is present.
   - Risk: the top player’s rotated presentation is appropriate for over-the-board play, but the small rotated helper text is harder to scan than the large clock. Pause behavior and a recovery/exit path are not visually prominent during play.

3. **Turn passed — healthy, with feedback opportunity**
   - Evidence: `03-turn-passed.png`
   - The active styling moves to Black and White becomes inactive, confirming the interaction worked.
   - Risk: the transition has no obvious persistent confirmation beyond the changed color/state. A short, non-blocking “Black to move” announcement or stronger active-state cue would help players verify a tap at a glance.

4. **Settings opened — healthy**
   - Evidence: `05-settings-viewport.png`
   - The bottom sheet has a clear title, close affordance, familiar switches, and a segmented layout choice. The scrim preserves context.
   - Accessibility risk: the close icon is small and icon-only visually; ensure its accessible name, focus treatment, escape behavior, and focus return are tested with keyboard and screen reader tooling.

5. **Custom time controls selected — needs polish**
   - Evidence: `06-custom-controls.png`
   - The three numeric fields are labeled and the disabled Start state communicates that required input is missing.
   - Risk: the validation message is exposed in the accessibility tree but is not visible in the captured viewport, and the disabled Start button is partially below the fold. Users may not know what is missing or why they cannot proceed. Keep the action and validation guidance visible together, and show concise inline guidance near Base minutes.

## Highest-impact changes

1. Make live-game pause, exit, and reset controls discoverable without competing with the clocks.
2. Keep custom-form validation and the Start action above the fold at the supported viewport sizes.
3. Add explicit, transient turn-change feedback and verify it is announced to assistive technology.
4. Make the visible Start label reflect the selected control, while preserving the richer accessible name.

## Evidence limits

Screenshots cannot establish actual hit-target dimensions, keyboard order, focus visibility, screen-reader announcements, color contrast ratios, timer accuracy under backgrounding, vibration/sound behavior, persistence, or behavior at other viewport sizes. Those require interaction, device, and automated accessibility testing.

