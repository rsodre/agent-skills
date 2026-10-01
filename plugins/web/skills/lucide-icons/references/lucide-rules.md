# Lucide's rules, in full

The specification and the design language from lucide.dev (`/contribute/icons/specification`,
`/contribute/icons/design-principles`), as read on 2026-09-22, followed by what the icons
themselves do — measured from `lucide-react` 1.28.0, 2,007 icons. The wording of the two lucide
pages is theirs; the measurements are ours.

## Requirement levels

- **Must** and **must not** mark required rules. They can only be broken when the project defines
  an explicit exception.
- **Should** and **should not** mark rules that can flex when needed to make a better icon. Any
  exception should be intentional and fit the design language.
- When two non-required rules conflict, choose visual clarity and consistency with the set.

## Canvas

- Icons must use a 24 × 24-pixel canvas, and it must be square.
- Icon strokes must remain at least 1 pixel from the edge of the canvas.

## Strokes

- Strokes must be 2 pixels wide.
- Strokes must use round line joins. Round joins do not replace corner rounding — most sharp
  corners still need a radius.
- Open paths must use round line caps.
- Strokes must be centred on their paths. Inside or outside strokes change how joins appear and
  create sharp inner corners.

## Corners

- Sharp corners should be rounded unless the geometry of the icon requires otherwise.
- Elements at least 8 pixels wide or tall should use a 2-pixel corner radius for 90° corners.
- Elements smaller than 8 pixels should use a 1-pixel corner radius for 90° corners.
- Diagonal lines meeting at a 90° angle should use a radius that preserves pixel-grid alignment,
  typically approximately 2.41 pixels (1 + √2).
- Acute corners should use an appropriate amount of rounding based on their geometry. Even very
  sharp corners usually need a small amount.
- Corners where multiple lines meet should remain sharp when rounding would cause the icon to
  render inconsistently at different sizes. Don't round corners where more than two lines meet.

## Spacing

- Distinct elements must have at least 2 pixels of visual separation.
- Gaps between distinct elements must not be smaller than 2 pixels.
- Inner gaps should be at least 2 pixels wide. Test by placing a 2-pixel-wide circle inside the
  shape: if it fits without overlapping, the gap is wide enough.
- Spacing should remain visually consistent where elements connect or intersect.
- Elements should not terminate with an abrupt cut where another element visually continues or
  intersects them.

## Visual weight

- Icons should have a visual weight similar to the `circle` and `square` icons.
- Icons should not appear substantially larger, smaller, heavier or lighter than comparable icons.
- The amount and placement of strokes affect how heavy an icon looks: many close strokes read
  heavier than a simpler icon at the same stroke width. Place the icon next to `circle` or
  `square`, blur both, and compare.

## Alignment and balance

- Icons should be visually centred within the canvas.
- Asymmetrical icons may be moved slightly off centre so they look visually centred.
- Symmetrical icons should be geometrically centred. Compare with `circle` or `square` side by
  side and stacked; if it looks shifted, adjust.

## Visual density

- Icons should have a level of detail similar to other icons in the set.
- Details should be simplified when they make an icon substantially denser than comparable icons.
- Details not necessary for recognition should be omitted. View at the intended size and blur:
  areas that turn dark have too much detail.

## Curves

- Continuous curves should have smooth curvature, with no unintended or abrupt changes.
- Arcs and quadratic Bézier curves should be preferred where they can represent the geometry.
- Cubic Bézier curves may be used where necessary; control points of adjoining cubics should be
  aligned to keep curvature continuous, and curves should not contain unnecessary control points.

## Pixel alignment

- Coordinates should align to the pixel grid where possible, and so should the centres of arcs and
  other geometric elements, and subelements, and diagonal lines — an off-grid diagonal appears
  blurry and optically wider on low-density displays.
- Off-grid geometry may be used when required for visual balance, recognisable geometry or smooth
  curvature. Pixel alignment should not take precedence over the visual quality of the icon.

## Shared geometry

- Variants of an existing icon should preserve the geometry, placement and orientation of the base
  icon. Reuse existing base icons exactly as they appear.
- Elements that already exist in other icons should reuse established geometry where applicable.
- Related icons should use consistent representations of shared elements; common modifiers and
  add-ons should use consistent geometry, size and placement.
- Existing geometry may be modified when necessary to satisfy other rules. Consistency with an
  existing icon should not override clarity, balance or readability.

## What the icons do (lucide-react 1.28.0, 2,007 icons)

The wrapper (`createLucideIcon`) emits every icon as
`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`
and each node as an element with the attributes given. From that:

| Measured | Count | Meaning |
|---|---|---|
| Elements restating `strokeWidth` | 0 | The weight is the wrapper's, never an element's. |
| Elements with a `fill` | 9 | Fill is an exception, not a tool. |
| `h.01` / `v.01` zero-length strokes | 137 | The dot: a 2px disc at the stroke's own weight. |
| `circle r="1"` (stroked) | 32 | The point: a 4px disc, the stroke closing the hole. `grip`, `circle-dot`. |
| `circle r="2"` (stroked) | 93 | The ring: 6px outside, 2px hole. `waypoints`, `git-commit`. |
| `circle r=".5" fill="currentColor"` | 9 | A 3px disc; used under an axis or inside a tag, never alone. |
| `circle r="10"` at 12,12 | `circle` | The weight reference; ink 1…23. |
| `rect` 18 × 18 at 3,3 `rx="2"` | `square` | The other reference; ink 2…22. |
| `rect` 7-wide panels | `rx="1"` | `layout-panel-*`: a 7-wide element is under 8, so 1. |
| `rect` 18-wide panels | `rx="1"` | `layout-panel-top`'s bar is 18 × 7 — the *smaller* dimension decides. |
| Diamond corners | `a2.41 2.41` | `diamond`: tips at 1 and 23, every corner at the diagonal radius, ink 1…23. |
| Arrow heads inside a circle | 4-unit barbs | `circle-arrow-*`: `m12 16 4-4-4-4`. |
| Bare arrow heads | 7-unit barbs | `arrow-right`: `m12 5 7 7-7 7`; chevrons 6, corner arrows 5. |
| List rows | 6, 12, 18 | Three rows six apart, whatever sits beside them. |

Two consequences worth stating:

- **The safe zone is measured in ink.** `circle`'s path is at 2…22 and its ink at 1…23; a stroked
  `r=1` point at `cy=2` reaches 0 and breaks the zone. A stroked path stays within 2…22, a stroked
  `r=1` centre within 3…21, a stroked `r=2` centre within 4…20, an unstroked fill's edge within
  1…23.
- **A rounded 90° diagonal corner's apex sits 1 unit inside its virtual tip** (the arc's centre is
  `r√2` along the bisector and the apex `r` back from it: `2.41 × (√2 − 1) = 1`). So a diamond with
  virtual tips at 1 and 23 has its path's extremes at 2 and 22, exactly `circle`'s.
