# Storybook setup

Storybook is not optional: **every primitive and every app module has a story beside it**, and for a
UI package with no app of its own, Storybook *is* the host — a story is where a component is actually
seen, and the all-variants story is how a change is reviewed before an app takes it.

**Two namespaces, mirroring two folders — and no third.**

```
src/
  components/primitives/Button.tsx        Button.stories.tsx        title: 'Primitives/Button'
  components/modules/NodeCard.tsx         NodeCard.stories.tsx      title: 'Modules/NodeCard'
  icons/Icon.tsx                          Icons.stories.tsx         title: 'UI/Icons'
```

`Primitives/*` is the stateless UI vocabulary; `Modules/*` is the composed, domain-aware pieces an
app assembles. **Pages and routes get no stories** — they are composition plus data plus routing, and
belong in the app.

## `.storybook/main.ts`

```ts
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [],
  framework: { name: '@storybook/react-vite', options: {} },  // or @storybook/nextjs-vite in an app
  viteFinal: config => ({ ...config, plugins: [...(config.plugins ?? []), tailwindcss()] }),
};
```

Add the Tailwind plugin here rather than in a `vite.config.ts` whose only content would be this.
In a Next.js app, use `@storybook/nextjs-vite` and `staticDirs: ['../public']` — without it, fonts
and art don't resolve.

## `.storybook/preview.ts`

```ts
const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true },
  },
  globalTypes: {
    theme: {
      description: 'The palette every primitive is built from',
      toolbar: { title: 'Theme', icon: 'paintbrush', items: THEMES.map(t => ({ value: t.id, title: t.label })), dynamicTitle: true },
    },
  },
  initialGlobals: { theme: DEFAULT_THEME },
  decorators: [
    (Story, context) => {
      applyTheme(context.globals.theme ?? DEFAULT_THEME); // sets the attribute on the iframe's <html>
      return Story();
    },
  ],
};
```

- **The app's own stylesheet is the only setup a story needs.** It puts the surface colour and the
  type faces on `<body>`, which the preview iframe gets for free, so a primitive is seen on the
  surface it sits on in the app. **Nothing here re-decides a token.**
- **A theme is a Storybook *global*, not per-story state.** A global survives navigating between
  stories and is written into the URL, so a palette chosen while reviewing one primitive is still on
  for the next — the only way to notice that a theme holds everywhere rather than on the page it was
  picked on.
- The theme decorator applies the same `data-*` attribute the app's provider does (see
  `coding-style` → Tokens decide everything).

## `.storybook/Story.tsx` — scaffolding, not primitives

Every story is one page showing every variant at once, so it needs three shapes and no more:

```tsx
export function Group({ label, children })  // a labelled band of controls in a row
export function Rows({ label, children })   // a column where the control is full-width
export function Page({ children })          // the page that stacks the bands
```

- **It lives in `.storybook/`, not `src/`** — it is not part of the package, and nothing an app
  installs should be able to import it.
- **Shared fixtures live here too** (sample data, placeholder images as inline `data:` SVGs, a story
  library). Two reasons: **a named export of a CSF module is read as a story**, so a fixture exported
  from a story file appears in the sidebar as an empty page; and a story that fetched an image would
  show a broken tile the moment Storybook ran anywhere but locally.

## The story file

```tsx
const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',          // mirrors the folder
  component: Button,
  args: { children: 'Button' },
  argTypes: {                          // cva's VariantProps is type-level: react-docgen can't
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'signal', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
};
export default meta;

export const All: Story = {
  render: () => (
    <Page>
      <Group label="Variants">…one of each…</Group>
      <Group label="Sizes">…one of each…</Group>
      <Group label="Disabled — no hover, no pointer, dimmed">…every variant, disabled…</Group>
      <Group label="className, merged last — wins over the variant">
        <Button className="w-64 border-signal">Full width, forced border</Button>
      </Group>
    </Page>
  ),
};

export const Playground: Story = {};
```

- **`All` is one page: every variant, every size, every mode, grouped by axis.** Never
  `Primary`/`Secondary`/`Large`/`Disabled` as separate stories — that hides the comparison the story
  exists to make.
- **`Playground` is the second story**, a controls-driven single instance, and it is empty: `meta`'s
  `args` and `argTypes` are what drive it.
- **Those two are the whole convention.** A third story needs a distinct *composition* (a real
  arrangement of several components), never a distinct prop value.
- **Group labels carry the rule they demonstrate** — "Disabled — no hover, no pointer, dimmed",
  "className, merged last — wins over the variant". The story doubles as the spec.
- **Include a `className` band** on any primitive that merges one: it proves the call site can still
  override.
- **Adding a variant means extending the `All` story in the same change.**

## A module story

Same two stories, one extra rule: **nothing is faked.** Build real domain state with the real
constructors, and drive every interaction through the same functions the app's own authority would
call — resetting really deletes the overrides, unlinking really materialises the element.

```tsx
const meta: Meta<typeof NodeCard> = { title: 'Modules/NodeCard', component: NodeCard };

export const All: Story = {
  render: () => {
    const [doc, setDoc] = useState(() => createDefaultDocument(STORY_LIBRARY));
    // …real registry, real descriptors, real document functions…
  },
};
```

That is what makes the story survive the domain growing: a kind added later, or a parameter added to
an existing one, appears in the story without the story being touched. Fixtures come from
`.storybook/`, never from the shipped data — a UI package may import the domain model and nothing
else.

**What the component doesn't own isn't in its story.** If one component arranges and another reads,
they are two components with two stories, and each story shows only its own half.
