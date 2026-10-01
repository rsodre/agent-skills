# The icons library

**Never import `lucide-react` in a component.** The app has one icon library; `lucide-react` is
named in exactly two files inside it and nowhere else in the repo, so swapping a glyph — or the
whole icon set — is an edit to one of those two.

```
src/icons/
  icons.tsx          the registry: one entry per MEANING → a drawing
  custom.tsx         glyphs the set hasn't got, authored through createLucideIcon
  Icon.tsx           the one component: cva sizes, line/solid, a11y, makeIcon
  index.ts           the named exports (PlayIcon, DeleteIcon…), all via makeIcon
  Icons.stories.tsx  the whole set, at every size
  <domain>Icon.ts    optional: derive an icon NAME from domain data, in one place
```

## The registry — one entry per meaning, not per drawing

```tsx
// icons.tsx
import { type LucideIcon, Circle, Play, Square, Trash2 /* … */ } from 'lucide-react';
import { ArrowOutUp /* … */ } from './custom';

export type IconGlyphs = {
  /** The outline drawing. Every name has one, and it is the only drawing there is. */
  line: LucideIcon;
  /** Whether painting that outline is a mark in its own right — what `variant="solid"` draws. */
  fillable?: true;
};

export const ICONS = {
  play: { line: Play },
  stop: { line: Square },   // same rectangle as `square`, and deliberately a second entry
  square: { line: Square },
  delete: { line: Trash2 }, // the NAME is the meaning; the drawing may change under it
  live: { line: Circle, fillable: true },
  arrowOutUp: { line: ArrowOutUp }, // authored here; the registry can't tell it apart
} as const satisfies Record<string, IconGlyphs>;

export type IconName = keyof typeof ICONS;
/** Every name, in registry order — the order the story lays them out in. */
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
```

- **A name says what the icon *means*, never what it draws** — `delete`, not `trash2`; `DeleteIcon`,
  not `Trash2Icon`. That is what lets the drawing change without a rename.
- **Two meanings that share a drawing are two entries.** `stop` and `square` are the same rectangle;
  a call site says which one it means, and either drawing may change without touching the other.
- **Group entries by domain with comments** (transport, files, navigation, state…). Where a choice is
  subtle, write the *why* on the entry — "deliberately not `edit`, which means change a value".
- **`as const satisfies`** keeps each entry's literal type, so an absent `fillable` is missing rather
  than optional.
- **Authoring a glyph is for a drawing the set hasn't got, never a restyle of one it has** — a set is
  a set because weight, grid and terminals agree. Author through the set's own factory
  (`createLucideIcon`) in `custom.tsx`, and register it exactly like any other entry. **How to draw
  one that belongs — the grid, the radii, the gaps, lucide's own dots and rings, and the review
  sheet — is [`lucide-icons`](../../lucide-icons/SKILL.md).**

## The component — one closed signature

```tsx
// Icon.tsx
const icon = cva('shrink-0', {
  variants: {
    size: {
      xs: 'size-3',    // 12px
      sm: 'size-3.5',  // 14px
      base: 'size-4',  // 16px  ← default, matches unsized type
      lg: 'size-4.5',  // 18px
      xl: 'size-5',    // 20px
      '2xl': 'size-6', // 24px
      '3xl': 'size-7.5',
      '4xl': 'size-9',
      '5xl': 'size-12',
    },
  },
  defaultVariants: { size: 'base' },
});

export function Icon({ name, size, variant = 'line', label, className }: DynamicIconProps) {
  const glyphs: IconGlyphs = ICONS[name];
  const Glyph = glyphs.line;
  return (
    <Glyph
      role={label === undefined ? undefined : 'img'}
      aria-hidden={label === undefined || undefined}
      aria-label={label}
      className={cn(icon({ size }), variant === 'solid' && glyphs.fillable && 'fill-current', className)}
    />
  );
}

/** Bind a registry name into a component — the only way a named export is made. */
export function makeIcon(name: IconName, displayName: string): IconComponent {
  const Bound = (props: IconProps) => <Icon name={name} {...props} />;
  Bound.displayName = displayName;
  return Bound;
}
```

- **The signature is closed: `size`, `variant`, `label`, `className`, and nothing else.** An icon is
  a mark inside something that is already a control, so it takes no `onClick`, no `tone` and no
  arbitrary SVG props. Colour comes from `currentColor` — the control around it decides — and a
  hover rule written on an icon would fight the button's own. Anything a call site needs beyond this
  goes on the node around it.
- **Sizes are the type scale, in its names and its pixel values**, because an icon is nearly always
  beside type and the two should be picked with one number: an icon in a `text-sm` row is
  `size="sm"`. Default `base` (16px). The scale stops where an icon becomes artwork — past that, use
  an asset.
- **Solid is the outline filled, never a second glyph.** The set draws one path stroked in
  `currentColor` over `fill: none`; painting that same path is what `variant="solid"` does, so both
  variants stay the same drawing at the same weight. A presentation attribute (`fill="none"` on the
  `<svg>`) loses to any rule, so one `fill-current` class beats it.
- **`fillable` is the entry saying that filling it means something.** A closed shape filled is a mark
  (a dot, a square); an open one filled is a smear — the fill spans the chord across a chevron's two
  strokes. Absent, `Icon` falls back to the outline, so `variant="solid"` stays valid on every name
  and no call site changes when a name gains the flag.
- **`label` omitted — the usual case, inside a control that is already labelled — hides the mark from
  screen readers** rather than having it read out twice.
- **Every named export is built by `makeIcon`**, so they share one signature and gain a feature
  together. There is no per-icon code to drift.

## Call sites

- **Use the named export when the glyph is known while writing the code**: `<PlayIcon size="base" />`.
- **Use `<Icon name={…} />` only when the glyph is chosen by data** — a list of kinds, a table of
  statuses.
- **Derive a data-driven icon in exactly one place, and return a *name*, not a component.** One
  module maps domain → `IconName`, with a stated-override table first and a fallback by category
  second; every surface that shows that thing calls it. Two copies is how two surfaces drift.

## The story

`Icons.stories.tsx` is the sheet: the size scale on one glyph, then **every name in the registry**
in an `auto-fill` grid, each cell captioned with its name.

- `parameters: { layout: 'padded' }` — the preview's `centered` default sizes the page to its
  content, and a grid meant to reflow needs the window.
- `argTypes` lists `name` (`control: 'select'`, options `ICON_NAMES`), `size` and `variant`.
- **Draw a box on the `<svg>` itself.** The trap it exposes: the set draws on a 24-unit square with
  its own padding, so the *drawing* is always smaller than the size name promises — and by a
  different amount per glyph. That is what bites when an icon sits in a control.
