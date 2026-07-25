# Apple HIG setup spike — design QA

## Source visual truth

- Source: `/Users/rickysullivan/.codex/generated_images/019f891b-cafe-7e73-a1f8-770c16f2acd0/exec-52bd5ab0-3211-4938-8e24-a38db60a767e.png`
- Source concept: Apple-HIG-inspired Zugzwang setup screen with a quiet selected-preset explanation.
- Source pixels: 1091 × 1441; normalized for comparison to 563 × 744 content height.

## Implementation evidence

- Screenshot: `docs/design/apple-hig-spike-setup.png`
- Viewport: 454 × 744 CSS pixels in the current in-app browser.
- State: setup screen, 3+2 preset selected.
- Comparison: `docs/design/apple-hig-spike-comparison.png`

## Comparison

The implementation preserves the intended hierarchy: brand/header, setup headline, preset grid, quiet selected-control explanation, and persistent Start action. The explanation is implemented as real text and updates from the selected control rather than being baked into an image.

The implementation is intentionally more compact than the generated concept because the current browser viewport is narrower. The difference is responsive density, not a product-flow change; the layout remains readable and the primary action stays visible.

## Required fidelity surfaces

- Typography: existing project typography and hierarchy are preserved; the explanation uses readable body sizes and a strong first line.
- Spacing/layout: preset grid and Start action remain in their existing responsive structure; the explanation adds a light divider and compact vertical rhythm.
- Colors/tokens: existing slate background, white surfaces, orange selection, and orange Start action are preserved.
- Image/assets: existing Zugzwang mark is reused from `/public/icons/zugzwang-mark.svg`.
- Copy/content: selected `3+2` now reads “3 minutes each, +2 seconds after every move.” with a plain-language cue.

## Interaction check

- Preset selection remains functional.
- Selected explanation updates from the active preset.
- Custom control selection still opens the existing custom form.
- Start remains the primary action.
- Selecting 10+0 updated the explanation to “10 minutes each, no added time.” and the balanced-play cue; the preview was restored to 3+2 afterward.
- Browser console: no errors observed.

## Findings

No actionable P0, P1, or P2 issues found in this spike. Remaining visual differences are P3-level responsive density differences from the generated concept and are intentional for the existing app viewport.

final result: passed
