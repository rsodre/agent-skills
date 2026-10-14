# iPhone Duo — review checklist

Run this against mockups or a build, **pose by pose**, then for cross-cutting concerns. Report each
failure as `pose · screen · what's wrong · rule broken · suggested fix`. Rules are explained in
[`../SKILL.md`](../SKILL.md). Implementation fixes are in the linked skills.

## The pose matrix

Go through every main screen, sheet and popover in each configuration:

| # | Configuration | Bars | Key risks |
|---|---|---|---|
| 1 | Closed, outer display, portrait | vertical (right) | content covered by the side column, offsets |
| 2 | Closed, outer display, landscape ("tent") | vertical | **overflow** (least height), keyboard up |
| 3 | Open flat, inner, portrait ("tall") | horizontal | stretched iPhone layout, wasted space |
| 4 | Open flat, inner, landscape ("wide") | vertical | split view columns, sidebar, asymmetry |
| 5 | Partially folded, book (vertical fold) | vertical | controls or popups in the fold, centred layouts |
| 6 | Partially folded, tabletop/laptop (horizontal fold) | per orientation | controls on the top half, alerts placement |
| 7 | Inner display, Split View, **left** half | vertical on the **left** | mirrored asymmetry, other app's edge |
| 8 | Inner display, Split View, right half | vertical on the right | |
| 9 | Inner display with pinned PiP above | per pose | height changing live |
| 10 | Open → close → open in the middle of a task | — | **state lost**, scroll position, selections, drafts |

## Per pose

- [ ] Nothing is clipped, stretched or letterboxed. Full-bleed media keeps its subject.
- [ ] Interactive content sits inside the safe area. Backgrounds may bleed.
- [ ] Nothing interactive collides with the camera, Dynamic Island or status bar.
- [ ] Centring: inset by default, full-width only for non-scrolling immersive screens.
- [ ] Bars: Back/Close at the top, prominent action next, groups kept, symbols with titles.
- [ ] Overflow: the most-used and badged items are still visible. One system overflow menu.
- [ ] Controls for a pane stay with that pane.
- [ ] (Folded) No buttons, fields or popups in the fold. Scrolling content may cross it.
- [ ] (Folded) Split columns are even. Grids keep tiles within one half.
- [ ] (Tabletop) Controls are reachable on the bottom half. Content and alerts are visible on top.

## Across poses

- [ ] **The same features** in every pose. Nothing exists only when open, folded or tabletop.
- [ ] **The same hierarchy.** The inner display adds at most one level, and only when it helps.
- [ ] **Small adjustments** when folding. No control jumps across the screen.
- [ ] Relative control positions are stable between vertical and horizontal bar poses.
- [ ] State, scroll position, selection and input survive every transition.
- [ ] The inner display is used well (split view, rearrangement or sidebar), not just stretched.
- [ ] Games: playable in every pose, fill the screen, text and controls the same size.

## Accessibility

- [ ] Every bar item and custom control has an accessibility label (the title).
- [ ] Largest Dynamic Type works on the outer display in landscape and in Split View.
- [ ] Reduce Transparency: custom bar content is legible on the solid vertical-bar background.
- [ ] VoiceOver order makes sense with bars on the side, and after folding.
- [ ] Hinge-driven and outer-display (accessory) features have on-screen alternatives.
- [ ] Right to left: content reflows correctly. Vertical bars stay on the same physical side.
- [ ] Tap targets aren't shrunk to fit. Items overflow instead.

## Bars quick audit (per screen)

| Item | Symbol | Title | Group | Placement | Axis | Priority |
|---|---|---|---|---|---|---|
| … | ✔︎/✘ | ✔︎/✘ | top/bottom | cancellation / pinned / default | auto / horizontalOnly / verticalPreferred | high / standard / low |

Flag: title-only items (they won't go vertical), custom views without an axis decision, a custom
ellipsis menu, manual spacers, and missing priorities on task-focused screens.
