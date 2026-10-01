---
name: lucide-icons
description: >
  Authoring and reviewing custom icons in the lucide style — a glyph the set has not got, drawn
  through `createLucideIcon` on lucide's 24-unit grid so it sits beside lucide's own without showing.
  Use when adding, redrawing or reviewing an icon in an app's `custom.tsx` (or any hand-written SVG
  icon node), when an icon looks wrong or blurry at 12–24px, when deciding whether to author a glyph
  or pick one, when a dot, a ring, a corner radius or a gap has to match the set, or when asked what
  lucide's design rules are. Ships `scripts/render-icon.mjs`, which draws an icon node on the grid
  and at native sizes beside `circle` and `square` and reports rule breaks.
---

# Lucide icons

How to draw an icon that belongs to the lucide set, and how to check one. The *library* around
the icons — the registry, the `Icon` component, `makeIcon`, the story — is
[`coding-style`](../coding-style/references/icons.md); this skill is what goes inside
`custom.tsx`. The full rule text is [`references/lucide-rules.md`](references/lucide-rules.md).

## Overview

Lucide is a set, not a collection: every glyph shares a canvas, a stroke, a way of rounding a
corner and a minimum gap, and that agreement is what a reader sees before any subject. An authored
glyph has to make the same agreements, or it is the one mark on the page that looks *slightly*
off and nobody can say why. The rules below are lucide's own, from its design language and its
specification, plus what its 2,000 icons actually do where the prose is silent — a dot, a point, a
ring, an arrow head — measured from `lucide-react` 1.28.0.

## Instructions

### 1. Decide whether to author at all

- **Pick before you draw.** Search lucide for the *meaning* and for its neighbours; a glyph that
  exists is used as it is drawn. Authoring is for a drawing the set has not got — a mirror it
  lacks, an orthogonal it only draws diagonally, a subject it has no word for.
- **Never restyle a glyph the set has.** A hand-adjusted copy of one member is how the set stops
  agreeing with itself. If lucide's drawing is wrong for the meaning, the meaning wants a different
  glyph, not a nudged one.
- **A variant reuses its base verbatim.** Take the base icon's node (`lucide-react` exports each
  as `__iconNode` from `dist/esm/icons/<name>.mjs`) and add to it; do not redraw it. Where a base
  has to be scaled or moved, say so in the comment and keep its radii scaling with it.

### 2. Draw on lucide's terms

| Rule | What it means in a node |
|---|---|
| **24 × 24 canvas** | Every coordinate is in `0…24`. `createLucideIcon` supplies the viewBox. |
| **1px safe zone** | Ink stays within `1…23`. A 2-wide stroke's *path* therefore stays within `2…22`; a stroked `r=1` circle's centre within `3…21`; an unstroked fill's edge within `1…23`. |
| **2px centred stroke, round caps and joins** | Supplied by the wrapper. **Never restate `strokeWidth`, `stroke`, `strokeLinecap` or `strokeLinejoin` on an element** — 0 of 2,007 lucide icons do — unless the glyph is a deliberate exception (see §4). |
| **Corners are rounded** | A `rect` ≥ 8 wide or tall takes `rx="2"`, a smaller one `rx="1"`; two diagonals meeting at 90° take **2.41** (`1+√2`, which puts the arc's apex back on the grid — `diamond` is drawn at exactly this); an acute corner takes less; **a junction where more than two lines meet stays sharp**, so a cross through a shape is not rounded at the crossing. Round joins do not replace this: a `path` corner is sharp unless an arc is written. |
| **2px between marks, inside and out** | Two distinct elements keep ≥ 2 units of *ink* clear; an inner gap is ≥ 2 wide. Test: a 2-wide circle fits without touching. Where a stroke meets another, it meets it cleanly rather than stopping 1 unit short. |
| **On the pixel grid** | Path coordinates, arc centres and rect edges on whole units (or halves where the geometry demands), diagonals included. A 2-wide stroke centred on a half unit paints three pixel rows at 24px where it should paint two. Off-grid is allowed for balance, recognisability or a smooth curve, and the tangent points of a rounded diagonal corner always are. |
| **Weight like `circle` and `square`** | `circle` is `r=10` at 12 (ink 1…23); `square` is 18 wide with `rx=2` at 3 (ink 2…22). Put the glyph beside both at 12 and 16px and blur: not lighter, not darker, not larger. |
| **Centred** | A symmetrical glyph is geometrically centred on 12,12; an asymmetrical one may shift a little to *look* centred. |
| **Low density** | Same level of detail as its neighbours; drop what recognition does not need. Close strokes read as weight. |
| **Simple curves** | Arcs and quadratics first; cubics only where the shape needs them, with aligned control points and no spare ones. |

### 3. Use the set's own vocabulary for the small things

The prose says nothing about a dot; the icons do. Reuse these exactly rather than inventing a
size — a point that is "about" lucide's is the one that looks wrong beside `grip`.

| Mark | How lucide draws it | Reads as | Where |
|---|---|---|---|
| **Dot** (a pixel of ink) | `['path', { d: 'M12 12h.01' }]` — a zero-length stroke with round caps | 2px disc | 137 icons: `circle-alert`, `ellipsis`, `info`… |
| **Point** | `['circle', { cx, cy, r: '1' }]` stroked by the wrapper, no fill | 4px disc (the stroke closes the hole) | 32 icons: `grip`, `grip-vertical`, `circle-dot`… |
| **Ring / node** | `['circle', { cx, cy, r: '2' }]` | 6px ring with a 2px hole | 93 icons: `waypoints`, `git-commit`, `gpu`… |
| **Tiny filled dot** | `['circle', { r: '.5', fill: 'currentColor' }]` | 3px disc | 9 icons only (`chart-scatter`, `tag`); too small alone at 12px |
| **Arrow head in a circle** | `m12 16 4-4-4-4` — 4-unit barbs at 45° | | `circle-arrow-right` family |
| **Bare arrow head** | `m12 5 7 7-7 7` — 7-unit barbs | | `arrow-right`; chevrons use 6 |
| **Panel** | `rect` 7 or 18 wide, `rx="1"` for the 7-wide, `rx="2"` for 18 | | `layout-panel-*`, `panel-*` |
| **List rows** | `M8 6h13`, `M8 12h13`, `M8 18h13` — three, six apart | | `list`, `layout-list`, `list-ordered` |
| **Diagonal square (diamond)** | tips at 1 and 23, every corner `a2.41 2.41` — ink 1…23 like `circle` | | `diamond` |
| **Fill** | Almost never. `fill="none"` is the wrapper's; a filled element is a deliberate exception and says why. | | 9 of 2,007 |

### 4. Author it

```ts
// custom.tsx — the file that *is* a drawing; icons.tsx maps a meaning onto it.
import { createLucideIcon, type IconNode } from 'lucide-react';

// A geometry two glyphs share is stated once, so a tip nudged in one cannot leave the other behind.
const HUB = 12;
const ARM = 10;

/** A coordinate as a path writes it: `12 - 8.9` is `3.0999999999999996` until it is asked to stop. */
const at = (n: number) => Number(n.toFixed(2));

/**
 * **Why this exists and what it shares with the set.** The comment above a glyph says what lucide
 * has not got, which existing shapes it reuses, and every deliberate exception — because the
 * next reader will see a number and want to "fix" it.
 */
export const DiamondLines = createLucideIcon('diamond-lines', [
  ['path', { d: rounded(TIPS, 2.41) }],              // two lines meet → rounded at the diagonal radius
  ['path', { d: `M${HUB} ${at(HUB - APEX)}V${at(HUB + APEX)}` }], // four meet at the centre → sharp
  ['path', { d: `M${at(HUB - APEX)} ${HUB}H${at(HUB + APEX)}` }],
]);

// Points at the set's own size: exactly what `grip` draws, so `points` and this are one mark.
export const DiamondPoints = createLucideIcon(
  'diamond-points',
  POINTS.map(([cx, cy]) => ['circle', { cx: String(cx), cy: String(cy), r: '1' }]) as IconNode,
);
```

- **Attributes are strings**, the name is kebab-case, and a `key` is not needed — the wrapper
  adds one.
- **State shared geometry once** as constants and derive the paths; a family that must line up
  is one set of numbers.
- **Round a polygon in code** rather than by hand: cut each corner back along both edges by
  `r / tan(θ/2)` and close it with an arc of `r`, sweep following the turn. One radius per figure,
  or one per corner where an acute corner wants less than a right angle.
- **Fill only when the drawing is the gap** — four faces standing clear of a cross, say — and then
  `fill: 'currentColor', stroke: 'none'` on that element, every corner rounded (a fill has no round
  join to soften it), and the channel between fills ≥ 2 units.
- **A deliberate exception is written down where it is made** — a half-weight stroke for lettering,
  a fill, an off-grid curve — with the reason and what was tried. A number with no comment is a
  number the next sweep will "correct".

### 5. Review it

Run the sheet and look at it — the report catches rule breaks, the picture catches everything
else:

```sh
# from a package that depends on lucide-react (or a monorepo root with packages/*)
node <skill>/scripts/render-icon.mjs --out /tmp/icons \
  src/icons/custom.tsx#DiamondLines,DiamondPoints \   # named exports of a createLucideIcon file
  lucide:grip lucide:diamond                            # the set's own, for comparison
```

Per icon it writes `<name>.svg`, `<name>.png` (headless Chrome where installed, else
`rsvg-convert`, else macOS `qlmanage`) and `<name>.txt`. The sheet is the glyph on the 24-unit
grid with the safe zone marked, and under it the glyph at 12, 14, 16, 20 and 24px beside `circle`
and `square`, on light and on dark. The report lists: path and ink extent, safe-zone breaks,
restated stroke attributes, fills, what each circle reads as, sharp or mis-sized rect corners,
cubic curves, and off-grid coordinates. Then check by eye, in this order:

1. **12px.** Does it still say what it means? Do the gaps survive, or has an inner channel closed?
2. **Weight** beside `circle` and `square`, light and dark. Blur if unsure.
3. **Balance**: is the ink's centre where the canvas's is, and if not, is the offset chosen?
4. **The family**: beside the glyphs it will sit with (its neighbours in a column, its variants).
5. **24px on a 1× display**: are the strokes crisp, or is a half-unit path painting three rows?

Loading a `.tsx` needs Node 23.6+ (or `--experimental-strip-types` on 22.6+) and a file with no
JSX, which a file of `createLucideIcon` calls never has; `lucide-react` is stubbed so no React is
involved. A `.json` holding an `IconNode` (or an object of them) works anywhere.

## Failure modes

- **A stroked `r=1` point placed on a tip at `2`** reaches ink `0` — the safe zone is measured in
  ink, so a family's reach is set by its widest mark.
- **A 1.5-unit channel between fills** reads at 24px and closes at 12px into a solid lozenge.
- **Four rows in an 18-unit band** can be centred or on the grid, not both; lucide's three at
  6/12/18 are.
- **A 90° rim gap round a 4-unit arrow head** leaves ~1 unit between barb and rim; put the rim's
  ends 6 across and 8 up (a 3-4-5 triangle on `r=10`, so both are on the grid) and the barbs stand
  exactly 2 clear.
- **A filled `r=1` circle with `stroke: 'none'`** is a 2px speck, half of `grip`'s point.
- **Restating `strokeWidth` to fit lettering** is sometimes right (three letters across 24 units
  do not fit at weight 2) — but then *every* element of that glyph restates it, the ink still stays
  in the safe zone, and the paths sit on half units so a 1-wide stroke paints one pixel column.
