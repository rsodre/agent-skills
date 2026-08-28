---
name: coding-style
description: >
  Binding formatting, TypeScript, React, Tailwind 4 and Biome rules for TypeScript projects. Use
  when writing or reviewing any .ts/.tsx code, setting up a project's toolchain, configuring Biome,
  writing a component or a hook (props, memoisation, effects, keys, state), building `ui/`
  primitives with cva variants and sizes, adding an icon or an icon library, writing Storybook
  stories, placing client state, reaching for `fetch` or a data hook, or deciding how something
  gets styled.
---

# Coding Style

Rules for all TypeScript code: formatting, language, React, styling, component APIs and Storybook.

Out of scope, by design:
- **Next.js structure and data flow** (`app/`, pages, providers, routes, queries, mutations) →
  `nextjs`
- **Workspace, packaging and test tooling** → `ts-monorepo`
- **Chain reads, writes and wallets** → `web3-chain-layer`

## Precedence

1. **The repo's own spec wins.** If a project carries a `specs/CODING_STYLE.md` (or equivalent)
   with a deliberate deviation, follow it — never "fix" a difference the project marked as
   intentional.
2. **Local code wins over this document.** Match the surrounding idiom: comment density, naming,
   structure. A rule that would make one file disagree with its neighbours is applied at the next
   sweep, not mid-task.
3. Everything else here is binding for new code.

## Formatting & linting (Biome)

- **Biome is the formatter *and* the linter.** No ESLint, no Prettier, no `.editorconfig` fights.
- **One root `biome.jsonc` for the whole workspace** — every app and package uses it. No
  per-package configs; a nested package gets an `{"extends": "//"}` stub at most.
  `.vscode/settings.json` sets Biome as the default formatter, mirroring the root config.
- **`.jsonc`, not `.json`** — the config carries inline comments, and that is the point.
- **2-space indentation, single quotes, semicolons, 100 columns, LF.** Never tabs.
  (4 spaces for Cairo/Python where a project has them.)
- **Every rule downgrade carries an inline comment saying why** — tracked debt, false positive, or
  intentional idiom. Never silently disable a rule, and never leave a downgrade without a way back.
- **A downgrade is that repo's debt, not a licence.** Porting a config into a clean repo means
  re-tightening every `warn`/`off` that existed only for legacy code.
- **Never silence a finding at the call site.** No `// biome-ignore` / `// eslint-disable` to make a
  warning go away: fix the cause, or downgrade the rule in the config with a written reason.
- **Import auto-sorting is off** (`assist.actions.source.organizeImports: "off"`) — it fights the
  manual grouping below.
- Legacy files keep their old formatting until a repo-wide sweep; **any file you touch gets
  formatted on touch**.

An annotated, ready-to-copy config is in [`references/biome.jsonc`](references/biome.jsonc). Two
traps encoded there:

- **`useBiomeIgnoreFolder` must stay `off`.** Its autofix rewrites directory content-excludes
  (`!**/dist/**`) to the bare form, which stops excluding the directory's *contents*.
- **`noDoubleEquals` is `error` with `{ ignoreNull: true }`** — the `!= null` idiom (catches null
  *and* undefined) is deliberate; every other loose comparison is a bug.
- **Biome 2.5+ parses Tailwind directives** (`css.parser.tailwindDirectives: true`), so the
  Tailwind entry stylesheet stays linted. Older setups excluded `**/styles/main.css`; drop that
  exclusion when you upgrade.

## Imports & file organisation

- **All source under a single `src/`**, organised by function: `app`, `components`, `hooks`, `lib`,
  `stores`, `types`, `constants`, `server`.
- **Path aliases only** — `@/*` → `src/*`, `@/assets/*` → `public/assets/*`. Never
  `../../../components/ui/button`.
- **Import order: `react` first, then external packages, then local (`@/…`).** Manual grouping,
  blank line between groups.
- **Import at the top of the file.** No `await import('…')` unless the load must genuinely be
  deferred (heavy optional dependency, server-only module in a shared file).
- **Remove unused imports.** They are a lint error, not a warning.
- **Cross-package imports use the package name**, never a relative path across a package boundary.
  Inside a package, relative is fine.
- Shared/domain types live in `src/types`.

## TypeScript

- **`strict: true`, and it stays on.** A port may start loose, but that is tracked debt with a
  tightening pass scheduled — not a style.
- **Domain types are hand-written.** Never `any` where a real type is cheap; remaining `any`s are
  tracked debt, listed as such.
- **Explicit return types on exported functions**; `void` when a function returns nothing.
- **Prefer `as const` objects + derived union types over `enum`.** `enum` emits runtime code, is not
  erasable syntax, and does not narrow from plain strings:
  ```ts
  export const PostStatus = { Draft: 'draft', Published: 'published' } as const;
  export type PostStatus = (typeof PostStatus)[keyof typeof PostStatus];
  ```
- **Native `bigint` for anything that can exceed `Number.MAX_SAFE_INTEGER`** — ids, token amounts,
  chain-scale integers. No `bn.js`, no `BigNumber`, no lossy `number`.
- **ESM only** (`"type": "module"`). Under `NodeNext`, relative imports in published packages carry
  explicit `.js` extensions.
- **A framework-owned file is not yours to format.** If a tool rewrites a file on build
  (`tsconfig.json`, generated bindings, `next-env.d.ts`), exclude it from Biome and leave it alone.

## React

### Props & referential stability

- **Every object or array passed as a prop is memoised with `useMemo`, and every function prop with
  `useCallback`.** A literal written in JSX is a brand-new reference on every render: it defeats
  `memo` on the child, re-fires every child effect that lists it, and re-runs every downstream
  `useMemo` keyed on it. The cost of getting it right is one line; the cost of finding it later is
  an afternoon, because nothing is *broken* — it is only slow, or blinking, or refetching.
  ```tsx
  // ❌ new object and new function on every parent render
  <Chart options={{ grid: true }} rows={rows.filter(Boolean)} onSelect={(id) => setSelected(id)} />

  // ✅ stable across renders
  const options = useMemo(() => ({ grid: true }), []);
  const visibleRows = useMemo(() => rows.filter(Boolean), [rows]);
  const onSelect = useCallback((id: string) => setSelected(id), []);
  <Chart options={options} rows={visibleRows} onSelect={onSelect} />
  ```
- **Hoisting beats memoising.** A value that depends on nothing is a module-level `const`, not a
  `useMemo(…, [])` — no hook, no deps, no render cost.
- **The dependency list is the whole point.** A `useCallback` whose deps contain a value that is
  itself new every render is a no-op with extra syntax. Memoise that value first, or drop the dep:
  `setState`, `dispatch` and store setters are already stable, and the functional form
  (`setState(prev => …)`) is how a handler loses its last dep.
- **Memoise the prop, and wrap the child in `memo` where it pays** — list rows, charts, canvases,
  anything with a heavy subtree. The two are one mechanism: a stable prop skips a render only if the
  child is memoised, and a memoised child skips one only while its props hold still. `memo` on every
  leaf is noise — the comparison costs more than the render it skips. Which components earn it, and
  what half a pair costs, is § Render cost.
- **Scalars need nothing.** Strings, numbers and booleans compare by value; memoising them is
  clutter. The rule is about references: objects, arrays, functions, JSX elements.
- **A context value is an object prop handed to every consumer** — memoise it, or every consumer in
  the tree re-renders whenever the provider does. Split contexts by change rate rather than shipping
  one grab-bag value.
- **`useMemo` earns its place for expensive calculations and for reference stability** — those two
  reasons. Not as a reflex on every expression.

### Render cost

Everything above is about reference identity; this is what identity is *for*. Reach for it when a
profile says so — and read a profile's two numbers as two different problems. `Button ×170, 3ms` is
a **count** problem: memoise it, stabilise what it is handed. `ParamControl ×50, 3ms` is a
**self-time** problem: `memo` will not touch it, and the work inside the body is what moves or gets
memoised. Same total, opposite fixes.

**The rules.**

- **`memo` and `useCallback` are one mechanism, and half of it does nothing.** A `useCallback`
  handed to an unmemoised child costs a hook and buys nothing; a memoised child handed a fresh
  arrow re-renders exactly as before, with a shallow compare added on top. Never ship one side
  without the other, in either direction — which makes the `useCallback` at a memoised component's
  call site load-bearing rather than decorative. The exception is a prop the child lists in a hook's
  deps: that one is memoised for correctness whatever the child is.
- **Memoise by count, not by feeling.** What is worth wrapping is what is *numerous* — the icon, the
  icon button, the row mark, the thing a rack draws dozens of and a hover redraws all of — because
  there its per-instance cost is the whole of its cost. **Write the list down** in the project's
  docs: "don't add a `useCallback` for a component that is not memoised" is unfollowable unless a
  caller can see which ones are.
- **A constant element beats a memoised component.** JSX that takes no props is a module-level
  constant, and a list of them is one `useMemo`: React compares elements by reference and skips the
  subtree outright rather than re-rendering it into the same thing.
  ```tsx
  const UNFED_MARK = <Icon name="unfed" size="xs" />;  // ✅ built once, compared by reference
  ```
- **Hoist empty literals too.** `[]` and `{}` written in a call are new every render and defeat the
  memo they are handed to; a shared `EMPTY_ROWS` const costs nothing and always compares equal.
- **A handler built inside `.map()` cannot be a `useCallback`, so the loop body becomes a small
  memoised component** which mints its own handlers from what it was handed.
  ```tsx
  // ❌ a fresh function per row, per render — every memoised row re-renders
  {rows.map(row => <Row key={row.id} onRemove={() => remove(row.id)} />)}

  // ✅ the row is a memoised component and closes over its own id
  const Row = memo(function Row({ id, remove }: RowProps) {
    const onRemove = useCallback(() => remove(id), [remove, id]);
    return <IconButton icon={DeleteIcon} label="Remove" onClick={onRemove} />;
  });
  ```
- **Pass ingredients, not closures.** Hand a per-row component the values its handlers need
  (`moveUpTo`, `removable`) rather than closures built over them in the parent. A closure is new by
  construction; a number and a boolean are not.
- **A pointer-driven render makes every unmemoised derivation cost pointer-rate.** Hover, drag and
  pointer-move state re-run the component body per event, so anything derived there is a `useMemo`
  or is moved out of the component that holds the state.
- **Subscribe at the leaf.** A parent that reads a value only to pass it down re-renders its whole
  subtree whenever it changes; the leaf that displays it reads it directly (see § Client state).

**Traps that look free.**

- **A CSS-only tooltip renders its body at all times.** No portal and no measurement is the trade it
  exists to make; the cost is that a tip built per row is *rendered* per row whether or not anyone is
  pointing at one. A tip whose content is more than a string gets its own memoised component and
  props that hold still.
- **A control used as a spacer pays a control's price.** Reserving a mark's width is a blank
  element, never an invisible or disabled instance of the real control — that one still builds its
  icon, its variants and its handlers to draw nothing.
- **`cn` parses every class string it is given, so merging three times up a wrapper chain parses the
  same classes three times.** A component composing pieces concatenates them with `clsx` and lets
  the root merge once. This is exact rather than approximate — `twMerge` resolves left to right, so
  a prefix merged early and the whole string merged once give the same answer — but **assert that on
  the project's real overrides** rather than trusting it, since it is the property the flattening
  rests on.
- **An absent optional prop is `undefined`, not `''`.** An empty string is still a class string `cn`
  parses and still a value every branch has to consider, where `undefined` is what "optional"
  already means. (A controlled input's `value` is the opposite rule — § Rendering.)

**When you do memoise.**

- **The type widens to `ComponentType<P>`.** `memo` returns an object React calls, not a function a
  caller could, so a `(props: P) => ReactElement` alias stops describing it the moment it is wrapped.
- **Set `displayName`** on the memoised export, or it is anonymous in the profiler — and the
  profiler is the only place this work is visible.
- **Walk up after wrapping a leaf.** An `Impl` name still in the profile is the tell that the memo
  is skipping nothing, because the parent is handing it something new every render. The fix is at
  the caller, not the leaf.
- **Don't double-guard.** A memoised component whose only child is a memoised component with the
  same props buys one skipped render for two shallow compares.

### Hooks

- **Hooks run at the top level, unconditionally, in the same order every render.** No hook inside a
  condition, loop, early return or callback. An early `return null` goes *after* the last hook.
- **Expensive initial state uses the lazy form**: `useState(() => parse(raw))`, never
  `useState(parse(raw))` — the eager form runs the work on every render and throws the result away.
- **A value that does not render is a ref, not state.** Timers, subscriptions, latest-value mirrors,
  scroll positions, "have I done this once" flags: `useRef`. Calling `setState` for something never
  read in JSX is a render nobody asked for.
- **Effects synchronise with something outside React** — a subscription, an event listener, an
  imperative widget, the document title. They are not for computing state from props: derive during
  render, and memoise the derivation if it is expensive.
- **Never set state unconditionally inside `useEffect`** — that is the infinite-loop shape.
- **State updates based on previous state use the functional form**: `setState(prev => …)`.
- **Reset state on identity change with `key`, not an effect.** `<Editor key={docId} />` remounts
  with fresh state; an effect that clears fields when `docId` changes renders the stale state first.
- **Every effect cleans up what it started** — listeners, timers, subscriptions, observers — and
  async work carries an `AbortController` or a cancelled flag, so a resolved promise never writes
  into an unmounted or superseded render.
- **No `useEffect` for data fetching** — see § Data access below; reads are `useQuery` hooks.
- **Dependency arrays are deliberate.** Projects that curate sync-on-change effects turn
  `useExhaustiveDependencies` off because its suggestions are mostly false positives there — that is
  a licence to *omit a dep on purpose*, never to omit one by accident. If the rule is on, satisfy it;
  if it is off, an incomplete array needs a comment saying why.
- **A repeated hook sequence is a custom hook.** It returns a stable shape, and if it returns an
  object, that object is memoised like any other — a custom hook is a prop factory.

### Rendering

- **`key` is a stable domain id, never the array index.** With index keys, an insert or a reorder
  hands row 3's state, focus and animation to a different row's data. Reads as data corruption.
- **Never declare a component inside another component.** It is a new type every render, so React
  unmounts and remounts the whole subtree — state lost, inputs blurred, effects re-run. Hoist it to
  module scope and pass props.
- **Conditional rendering is a ternary, not `&&`.** `count && <List />` renders a literal `0` when
  the count is zero; `items.length > 0 ? <List /> : null` says what it means.
- **State is replaced, never mutated.** `setItems([...items, next])`, not `items.push(next)` — a
  mutated array is the same reference, so nothing re-renders and `memo` children never update.
- **A controlled input never receives `undefined`.** `value={name ?? ''}` — going from `undefined` to
  a value flips the input from uncontrolled to controlled and React warns and drops keystrokes.
- **Generated ids come from `useId`**, never `Math.random()` or a module counter: those differ
  between server and client render and break hydration.
- **Object stability applies to locals too**: never assign an object or array literal to a variable
  in the component body when it feeds another hook's deps.
  ```tsx
  const config = { apiKey };                           // ❌ new reference every render
  const config = useMemo(() => ({ apiKey }), [apiKey]); // ✅ stable
  ```
- **`catch {}`** when the error is unused, never `catch (e) {}`.

## Client state (zustand)

Client state that outlives a component goes in `src/stores/`, one file per concern
(`<concern>-store.ts` exporting `use<Concern>Store`). Component-local state stays `useState`;
**server data is react-query's job, never a store**.

- **Read and write the store directly, one field at a time.** A whole-store selector re-renders on
  every unrelated change. No `useXActions` wrappers, no passthrough read hooks.
- **Setters live in the store**, beside their state. A transition with logic (cycling a list,
  clearing a group of flags) is a named method, not an expression re-derived at each call site.
- **UI state belongs in a store when more than one component needs it** — modal/dialog open state is
  the classic case; keep it in a `ui-store` rather than lifting `useState` through props.
- **Durable user preferences are persisted** — a settings store uses `persist` with no `partialize`.
  Per-session UI state gets its own unpersisted store.
- **`partialize` is for state that would contradict itself, not for trimming.** Persist the seed and
  the move list, not the board derived from them — storing both lets a restored session disagree
  with its own history.
- **Persisted stores use `skipHydration` and rehydrate on mount.** Reading a persisted value during
  the first client render is a hydration mismatch. One provider rehydrates every persisted store.
  The cost is one frame of defaults; pay it rather than reading during render.

## Styling (Tailwind)

- **Tailwind 4, configured in CSS.** `postcss.config.mjs` and `@theme` in the stylesheet;
  deliberately **no `tailwind.config.*`**.
- **No Radix.** Not Radix Themes, not Radix UI, not `@radix-ui/*` primitives — do not add them to a
  project, and do not reach for them when a component needs a popover, dialog or tabs. Build the
  primitive in `components/ui/` with Tailwind + cva. Older projects still carrying Radix are legacy:
  don't extend that surface, and remove it when you touch it.
- **One stylesheet**, `src/styles/main.css`: the Tailwind import, `@theme` tokens, base element
  styles, and the few irreducible globals. No SCSS, no CSS Modules, no per-component CSS.
  A second file needs a reason that decides nothing — `fonts.css` holding only `@font-face` is the
  usual sole exception.
- **Style elements directly instead of inventing classes.** Shared defaults go on element selectors
  in `main.css` (`button { … }`, not `.button-class`); one-offs go on the component as utilities.
- **An element earns a class only when it needs more than styling** — behaviour targeting, or a
  layout class reused on plain elements.
- **`style` prop only for dynamic runtime values** (computed positions, sizes, colours). Never for
  static styling.
- **`cn()` (clsx + tailwind-merge) composes conditional classes.** No string concatenation, no
  template literals for class names.
- **Every component takes an optional `className`**, not just `ui/` primitives, merged **last**
  through `cn()` onto the root element so the call site wins. Without it, callers are forced into
  wrapper divs.

```tsx
// ✅ element styled directly; cn() for conditions; style only for dynamic values
<button className={cn('px-4 py-2', isActive && 'bg-accent')} style={{ left: `${x}px` }}>

// ❌ needless custom class, string-built classNames, static style prop
<button className={'button-class ' + (isActive ? 'active' : '')} style={{ padding: 8 }}>
```

### Tokens decide everything, components decide nothing

- The `@theme` token sets (`--color-*`, `--shadow-*`, `--font-*`, `--animate-*`) generate the
  utilities. Reach for `shadow-card`, never a hand-rolled `shadow-[…]`, and **never a literal colour
  or font family in a component**.
- **A theme may be light.** Never assume the surface is darker than the ink: `bg-black` for a well,
  a shadow standing in for a border, or a colour picked because the default palette is dark is drift
  exactly as a raw hex is. Every colour is a token, and the token set holds in both directions.
- **A named token carries meaning — spending it elsewhere costs it that meaning.** If one colour
  means *live* and another means *refused*, they appear nowhere else.
- **Keep the palette to a few knobs** — a background, a text colour, an accent — with panel/line/
  border tones `color-mix()`ed from them, so re-pointing one knob moves everything derived from it.
- **A setting the CSS consumes is an attribute on `<html>`**, not a class and not inline styles: the
  provider mirrors it to `data-*`, `main.css` re-points one token per value, and every derived tone
  follows. **Components never read a setting to pick a colour.** Because the `color-mix()`es are
  declared on the same element, they resolve against the override for free — a new theme is a tone
  plus a two-line block.
- **Type roles are named for the role, not the face** — `--font-title`, `--font-mono` — and fonts
  are self-hosted. No component ever names a font family.
- **Property animations are `--animate-*` + `@keyframes` in `@theme`**, not a class.
- **Base element styles go inside `@layer base`.** Outside a layer they beat every utility by source
  order, and a `<h3 className="text-accent">` would silently do nothing.

### Icons: one library, never lucide directly

**Icons come from `lucide-react` — and no component ever imports it.** The app has its own icon
library (`src/icons/`), and `lucide-react` is named inside it and **nowhere else in the repo**, so
swapping a glyph, or the whole icon set, is an edit to one file.

- **No inline SVG, no icon fonts, no second icon package** anywhere else.
- **The registry maps a *meaning* to a drawing.** An entry is named for what it means (`delete`,
  `live`, `changed`), never for what it draws (`trash2`, `circleSmall`, `asterisk`) — that is what
  lets the drawing change without a rename. Two meanings sharing one drawing are two entries.
- **One `<Icon>` component, with a closed signature**: `size`, `variant`, `label`, `className`, and
  nothing else. No `onClick`, no colour prop — colour is `currentColor`, so the control around it
  decides, and a hover rule on an icon would fight the button's own.
- **`size` is the type scale**, in its names and its pixel values (`sm` = 14px beside `text-sm`),
  defaulting to `base` = 16px. Size with the prop, not with a `className` — that is what a variant
  axis is for.
- **Call sites use the named export** (`<PlayIcon size="base" />`), built by one `makeIcon` factory so
  every icon shares a signature. `<Icon name={…} />` is only for a glyph chosen by data — and that
  choice is derived in **one** module that returns a *name*, not a component.
- **An alias is an export, not a second registry entry.** Two names for one drawing are two
  `makeIcon` exports over the same registry name, so a call site says what it means and the drawing
  behind both moves in one line.
- **The library has its own story**: the size scale plus every registered icon in a grid.
- Artwork (illustrations, game art, logos) is **not** an icon; it lives in `public/assets/`.

Full pattern, registry and component skeleton: [`references/icons.md`](references/icons.md).

### Look before you draw

**Read this before writing any UI, not only before authoring a primitive** — composing a screen is
where these rules get broken, because that is where it is easy to think none of them apply.

- **In this order: an existing component, then one of its variants, then a new component last.** A
  row, a fold, a mark or a gutter that looks new is nearly always one that exists — that is what the
  Storybook sheet is for. **Before adding a prop, a class or a component, say which existing one you
  looked at and why it does not fit.**
- **A variant that exists for exactly your case is the trap.** Taking the default because it renders
  acceptably is how a row ends up indented out of the column it belongs to. Read the variant list
  before picking, not after it looks wrong.
- **Compose, don't re-derive.** A control that is a button — a toggle, a segment, an icon button — is
  built out of `Button`, so a new size or variant reaches it for free.
- **Shared geometry lives in one module.** A column width, a row height or a label style written
  anywhere else is drift by definition.
- **A behaviour the data already drives is stated on the data, never re-implemented at the call
  site.** If a descriptor says a row is folded, a component that positions it itself has made a
  second answer to a settled question.
- **A settled global is declared once.** Text selection and the I-beam are turned off on `body`, with
  the caret given back to what is typed into — a `select-none` on a label is that same second
  answer.
- **A comment block above each component says why it looks and behaves as it does** — what the
  variant means, what it is for, what it deliberately does *not* do. Never what the code does.

### Component styling API: props & variants

**Reach for `variant` and `size` before anything else.** A component's look and scale belong on two
typed axes, not in class strings at the call sites and not in a spread of one-off booleans. When the
same class keeps getting passed to a shared primitive (`components/ui/`), pull it into the
component's **typed API**.

- **One file per component**, exported from `src/index.ts` with its props type. A **primitive** knows
  nothing about the domain — it is handed values and hands back edits; a **module** speaks the app's
  vocabulary. A module composes primitives; **a primitive never imports a module.**
- **Atomic, single-purpose class → boolean/enum prop.** One CSS concern
  (`image-rendering: pixelated`, `margin: auto`, `width/height: 100%`) becomes a prop:
  `<Image pixelated centered fluid />`, not `<Image className="PixelArt Centered FillParent" />`.
- **Reusable, multi-property bundle → `variant`**, defined with **`class-variance-authority` (cva)**
  inside the component, its output merged with the incoming `className` through `cn()` so call sites
  can still override.
- **`variant` is the *look*, `size` is the *scale*, and every primitive names them the same way.**
  `variant` is an emphasis ladder whose core is `primary` (default) / `secondary` / `ghost`, plus the
  project's own rungs — the "one thing they came to do" (`accent` / `signal`) and, where it applies,
  a destructive `danger`. `size` is `sm` / `md` (default) / `lg`. **Fix the ladder once per project**
  and use those exact names everywhere: never invent `type`/`kind`/`color` or `small`/`big` for the
  same axes, and never give two primitives different names for the same rung.
- **Always give an axis a `defaultVariants` entry**, so the bare component is the common case.
- **A variant earns its name from a real call site**, not from a design system in the abstract.
- **A primitive that only scales takes `size` alone** — a spinner at the icon sizes its buttons use,
  a badge at badge sizes — rather than a `variant` axis invented to match its neighbours.
- **The emphasis rung (`accent`/`signal`) is the one thing on a page the user came to do — never two
  on a page.**
- **Interactive feedback is motion, not fading**: `not-disabled:hover:scale-105` swells,
  `not-disabled:active:scale-95` snaps down at half the duration. **`opacity` means disabled**, so
  no variant dims on hover.
- **Gate every interactive state behind `not-disabled:`.** An un-gated `hover:` still fires on a
  disabled control and undoes `disabled:opacity-50`. Real bug; don't reintroduce it.
- **Delete the class from `main.css`** once nothing references it. Keep it only while plain elements
  outside the primitive still use it — the prop serves the primitive, the class serves the rest, and
  they coexist until those call sites migrate.

```tsx
const imageVariants = cva('max-w-full', {
  variants: {
    variant: { hero: 'mx-auto h-auto w-full max-w-[250px] min-w-[180px]' }, // was .HeroImage
    pixelated: { true: '[image-rendering:pixelated]' },                     // atomic → prop
    centered: { true: 'mx-auto block' },                                    // atomic → prop
  },
  defaultVariants: { variant: 'hero' },
});
type Props = VariantProps<typeof imageVariants> & { className?: string };
// <img className={cn(imageVariants({ variant, pixelated, centered }), className)} />
```

Net effect: styling migrates into components' typed APIs, and `main.css` shrinks toward tokens, base
element styles, and irreducible globals.

## Storybook

**Always Storybook.** For a UI package with no app of its own, Storybook *is* the host — a story is
where a component is actually seen, and the all-variants story is how a change is reviewed before an
app takes it.

### What gets a story: primitives and modules, never pages

Two kinds of thing are storied, and they live in two folders with two matching namespaces:

| folder | `title` | what it is |
| --- | --- | --- |
| `components/primitives/` | `Primitives/Button` | the stateless UI vocabulary — a control, a panel, a field. Knows nothing about the domain. |
| `components/modules/` | `Modules/NodeCard` | an app module — a composed, domain-aware piece of the product. |
| `icons/` | `UI/Icons` | the icon library's own sheet. |

- **No page or route stories.** A page is composition plus data plus routing; exercise it in the app.
  Storybook covers the pieces pages are built from, and stops there.
- **Keep the two kinds apart in the folder tree, not just in the title.** A primitive that starts
  reading domain types has become a module and moves; a module that turns out to know nothing about
  the domain becomes a primitive.
- **A module story runs on real domain state and real domain functions**, never faked props — a real
  document, a real registry, and the same functions the app would call. That is the property the
  story exists to have: a new kind, or a new parameter on an existing one, shows up in the story
  without the story being touched.
- **What a component doesn't own isn't in its story.** If one component arranges and another reads,
  that is two components and two stories — the split in the stories is the split in the code.

### The two stories

- **One story per component, not one per variant.** `All` is a single page showing **every variant,
  every size and every mode** — grouped by axis, plus the states that matter (disabled, loading,
  empty) and a band proving `className` still wins. **Never** split into
  `Primary`/`Secondary`/`Large`/`Disabled`: that hides the comparison the story exists to make.
- **`Playground` is the second story** — a controls-driven single instance, empty in the file,
  driven by `meta`'s `args`/`argTypes`. Those two are the whole convention; a third story needs a
  distinct *composition*, never a distinct prop value.
- **Adding a variant means extending the `All` story in the same change.**
- **Group labels carry the rule they demonstrate** ("Disabled — no hover, no pointer, dimmed";
  "className, merged last — wins over the variant"), so the story doubles as the spec.
- **Declare `variant`/`size` in `argTypes`** (`control: 'select'`). cva's `VariantProps` is
  type-level, so react-docgen can't see it and the Playground silently loses its controls.

### Setup

- **Stories decide nothing about styling.** `preview` imports the app's stylesheet and nothing else,
  and a theme is a Storybook **global** (toolbar + decorator) so a palette chosen on one story is
  still on for the next. A story that hand-rolls a background is testing the story.
- **Scaffolding and fixtures live in `.storybook/`, not `src/`** — they are not part of the package,
  and a named export in a story file is read as a story, so a fixture exported from one shows up in
  the sidebar as an empty page.
- **A story is not a test and not a route.** Anything needing auth, a wallet or live data is
  exercised in the app.

Config, scaffolding and a story template: [`references/storybook.md`](references/storybook.md).

## Data access: TanStack Query, never a bare fetch

**No component, hook or effect calls `fetch` (or an SDK's request method) directly.** Every read is a
`useQuery` and every write is a `useMutation`, each behind its own named hook. A bare call in a
component has no cache, no dedup, no retry, no `isLoading`, no invalidation and no shared error
handling — every one of which then gets re-invented, differently, at the next call site.

- **Reads → one `useQuery` hook per query**, in `hooks/queries/use-<resource>.ts`, owning its query
  key. Callers get `data`/`isLoading`/`error` and nothing to wire up.
- **Writes → one `useMutation` hook per operation**, in `hooks/mutations/`, over the app's shared
  mutation wrapper so error reporting and toasts stay centralised.
- **`useEffect` + `fetch` + `useState` is the anti-pattern this replaces.** It is a race with no
  cancellation, and it refetches on every unrelated re-render.
- **Never fetch your own API route by hand from a component** — that is what the query hook is for.
- **Don't wrap a library that already runs on TanStack Query** (see `nextjs` §0 and
  `web3-chain-layer`): use its hooks bare, or you get two caches that disagree.
- **The exceptions are server-side and one-shot**: a `fetch` inside a route handler, a server action
  or a service function is the right thing — that code *is* the data source the query hook calls. A
  one-shot SDK promise with no hook of its own still goes through `useQuery`, keyed like any other.
- **Which library**: `@tanstack/react-query`, one shared `QueryClient` for the whole app.

## External APIs & error handling

- **Wrap every external API call in try/catch** and `console.error` the **API name, the URL, the
  options, and the raised error** — enough to reproduce it without a debugger.
- **Every failed external call is visible to the user**, through the centralised error toast, not a
  silent console line (see `nextjs` → Toasts).
- **Gate logging behind the project's logger**, never a bare `console.log` in shipped code.

## Native-first

- **Prefer native platform resources over wrapper libraries** — `<audio>` over player libs,
  `matchMedia` over device-detect libs, `JSON.stringify(x, null, 2)` over pretty-printers,
  `fetch` over HTTP clients, `document.cookie` / `cookies()` over cookie libs, a module-level
  counter over a store library.
- **A new runtime dependency needs a reason the platform can't cover.**
- **When a dependency *is* right, use the official SDK of the service**, not a homegrown wrapper and
  not a third-party fork.

## Traps worth remembering

- **`<img>` positioned over a canvas needs `max-w-none`.** Tailwind's preflight ships
  `img { max-width: 100% }`, and 100% resolves against the containing block — over a canvas that is
  an *anchor point*, 0–1px wide. The image loads and paints as an invisible sliver while `size-*`
  appears to do nothing. Reads as a positioning bug. Divs are immune.
- **A background on `<body>` paints above `body`'s negative-z children.** Put a full-page surface
  colour on `<html>`.
- **CSS filters apply before masking**, so a `drop-shadow` on a masked element shadows the flat
  rectangle, not the mask. Build the bevel as a second masked element.
- **A `filter`-based animation swallows `drop-shadow-*`** on the same element — they share the
  property.
