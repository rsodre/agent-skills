---
name: ts-monorepo
description: >
  Conventions for pnpm workspace monorepos and publishable TypeScript packages: the catalog and
  `workspace:` protocol, single-source-of-truth root config, toolchain pinning, install-script
  policy, ESM package layout and exports maps, public-API boundaries, build order, and Vitest
  testing rules. Use when setting up or restructuring a workspace, adding a package or dependency,
  configuring builds/publishing, or writing tests.
---

# TypeScript Monorepo & Package Authoring

Workspace-level rules. Code style lives in `coding-style`; app data flow lives in
`nextjs`.

## Workspace shape

- **pnpm is the sole package manager.** A workspace can hold several projects, each with its own
  job; organise them as pnpm workspace members (`apps/*`, `packages/*`).
- **One lockfile, one Biome config, one `tsconfig.base.json`** at the root. Package `tsconfig.json`s
  extend the base and add `include: ["src"]` and nothing else they don't need. The root
  `tsconfig.json`, if present, exists for the editor only.
- **The root holds tooling and docs, never app code.** Root `package.json` is private and carries
  proxy scripts, `packageManager`, `engines`, and the install-script policy.
- **Run everything through the workspace scripts** (`pnpm build`, `pnpm test:<pkg>`), not bare
  tools — the scripts encode filters and ordering that matter.
- **One gate command, and everyone runs it**: `check` = `lint && check-types && test`. It is what CI
  runs and what an agent runs before declaring done, so "green" means one thing. Per-tool scripts
  stay available for iterating; the gate is the definition.
- `pnpm --filter <pkg> <script>` runs one package's script directly.
- **Turborepo/Nx only when it earns its keep.** With a single member, plain pnpm is the answer; add
  a task runner when there are real cross-package task graphs to cache.

## Dependencies

- **Shared external versions live in the pnpm catalog** (`pnpm-workspace.yaml` `catalog:`), and
  manifests reference them as `"catalog:"`. **Bump the catalog, never a package manifest.**
- **Check the catalog before adding a version anywhere.** A dependency used by two packages belongs
  in the catalog the moment the second one needs it.
- **Internal deps use the `workspace:` protocol** (`"@scope/core": "workspace:*"`).
- **Toolchain versions are pinned** — `packageManager` in the root manifest, plus `.nvmrc` /
  `.tool-versions` for Node. Never rely on whatever is globally installed.
- **Every dependency with an install script gets an explicit answer.** pnpm 11's `allowBuilds` map
  *fails the install* for an unanswered package (`ERR_PNPM_IGNORED_BUILDS`) rather than skipping it
  quietly; older pnpm uses `onlyBuiltDependencies` in the **root** manifest. Answer `true`/`false`
  **with the reason** — e.g. `sharp: true`, only so image optimization can be switched on without a
  reinstall.
- **A new runtime dependency needs a reason the platform can't cover** (see `coding-style` →
  Native-first). In a published package that bar is higher still.

## Package boundaries

The rules that keep a workspace a workspace rather than one program in several folders. State them
as guardrails in `CLAUDE.md` (see `spec-discipline`), because breaking one is drift, not a shortcut.

- **A shared package never branches on its host.** No `isElectron`, no `typeof window.myApp`, no
  optional prop meaning "work it out yourself". A **host supplies an implementation of a declared
  interface**, and a capability it lacks is an empty list or a no-op — not a special case inside the
  shared code. **Only a composition root may construct one** (`app/src/main.tsx`,
  `web/src/main.tsx`), so there is exactly one place per host that knows what it is running in.
- **Write each package's allowed imports down, as a rule with a reason.** "The UI package imports the
  model package and nothing else in the repo"; "the render core imports no platform API — it takes a
  canvas and renders". A boundary nobody wrote down is one that erodes in a week.
- **Name what a package must still be able to run in**: a package that has to work in a plain browser
  tab may not reach for a native or platform-only dependency, however convenient.
- **The platform decides what is offered; the host decides what works.** Something unavailable on
  this platform isn't drawn at all; something the running host hasn't loaded is drawn *disabled*,
  never omitted — so two hosts on one machine present the same surface.
- **A shared package never names a host-local resource.** The catalogue of what exists and the wording
  that describes it each live in one package; a second copy is how a label drifts from its id.

## Publishable packages

- **Keep the core package at zero runtime dependencies**, and keep the ones next to it as close to
  zero as possible (data + core as a peer, and no more). This is a property you defend, not one you
  rediscover.
- **A framework is a peer dependency, never a direct one** — React is `peerDependencies: "^18 || ^19"`
  in the bindings package, and **no framework import exists outside that package**.
- **ESM only** (`"type": "module"`, plain `.js` output). Under `NodeNext`, relative imports carry
  explicit `.js` extensions.
- **The public API is exactly what `index.ts` and the `exports` map re-export.** Internal
  cross-module helpers are prefixed `__` (`__importDataSets`) and are never exported from the root.
  Adding an export is an API decision; make it deliberately.
- **Manifests carry `exports` maps + `files: ["dist"]` + `sideEffects: false` +
  `publishConfig.access`.** Multi-entry packages (one entry per dataset/world/locale) let consumers
  bundle only what they import.
- **Gate packaging in CI**: `publint` + `arethetypeswrong` (esm-only profile) over each package's
  packed output, and a docs gate if the package is documented (undocumented export ⇒ red).
- **Domain types are hand-written and their semantics are frozen** when they mirror an external
  contract (an on-chain struct, a wire format, a packed integer). Treat a change to them as a
  compatibility decision, with the justification written down.

## Build & typecheck

- **A bundler builds; `tsc` only type-checks.** Bundle with tsdown/tsup/rolldown into `dist/` (ESM +
  bundled `.d.ts`); `tsc --noEmit` is a separate `typecheck` gate that never emits.
- **`tsconfig.base.json` is the single source of compiler truth** (`moduleResolution: bundler` or
  `NodeNext`, `isolatedModules`, `strict`, a modern `target`), including any `paths` for subpath
  entries.
- **Build order matters — build sequentially** when downstream `.d.ts` bundling reads an upstream
  package's built types. Prefer the ordered script over an unordered recursive run whenever a fresh
  build must succeed.

## Testing (Vitest)

- **Vitest**, one `vitest.config.ts` per package, tests in `test/` as `*.test.ts`.
- **Import `describe`/`it`/`expect` explicitly from `vitest`** — no globals.
- **Custom failure messages use the native second argument**: `expect(actual, 'message')`.
- **Cross-package imports resolve to source via `resolve.alias`** so tests run without a prior
  build; anchor the aliases (`/^@scope\/core$/`) so subpath entries aren't swallowed.
- **Pin the values that encode an external contract.** Suites that assert exact packed integers or
  serialised shapes are a compatibility fence: a change must keep them green, or change them with a
  written compatibility justification.
- **Watch for process-wide singletons.** When a module holds a global registry, tests that populate
  it share state — reset or isolate, or the suite passes only in one order.
- **Run tests through the workspace scripts**, and remember `pnpm --filter <pkg> test -- <pattern>`
  for a single file.

## Checklist for a new package

- [ ] `workspace:*` for internal deps, `catalog:` for shared external ones.
- [ ] `tsconfig.json` extends the base; `include: ["src"]`.
- [ ] `exports` map, `files: ["dist"]`, `sideEffects: false`, `publishConfig.access`.
- [ ] Frameworks are peers; runtime deps justified.
- [ ] `index.ts` states the public API; internals prefixed `__`.
- [ ] `vitest.config.ts` with source aliases; tests in `test/`.
- [ ] Added to the root build script in the correct order.
