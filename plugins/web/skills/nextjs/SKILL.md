---
name: nextjs
description: >
  Binding conventions for a Next.js App Router project: where files live (routes as mount points,
  pages as component folders, providers, hooks), and how data crosses the server/client boundary —
  API query routes + TanStack Query hooks for reads, server actions + `useActionMutation` hooks for
  writes, a shared service layer, and centralised sonner toasts. Use when adding a route, page,
  provider, API route, server action or react-query hook, or when reviewing App Router structure or
  data-layer code.
---


# Next.js

Conventions for a Next.js App Router project — **structure** (part 1) and **data flow** (part 2).
Paths are relative to the app root (`src/`). Language, styling, state and component rules live in
`coding-style`; chain reads and writes live in `web3-chain-layer`.

# Part 1 — Structure

## `app/` is routing only

`src/app/` holds only what Next.js requires — `layout.tsx`, `page.tsx`, `api/`, `actions/`, and
metadata files. Everything else is a component.

- **A route file is a mount point.** `app/page.tsx` renders `<HomePage />` and nothing more; markup,
  state and layout belong to the component.
- **A page is a folder**: `components/pages/<page>/` holds the page component *and* every component
  built for that page alone — including whatever a `layout.tsx` mounts, and the page's own layout
  constants. A component leaves the folder when it becomes genuinely generic, or **the day a second
  page needs it** — not in anticipation.
- **New UI is a component first**; a route only ever grows an import.
- **Providers are components**, in `components/providers/`, one per file. Provider order is explicit
  and documented; the root `layout.tsx` (a server component) imports the global CSS and the site
  `metadata`/`viewport`, then renders the `'use client'` provider tree.
- **Hooks live in `src/hooks/`** — `queries/` and `mutations/` for the data layer (part 2), the root
  for UI and app hooks.
- **Server-only code holding secrets stays in `src/server/`**; generic helpers in `src/lib/`;
  cross-app code in a workspace package.
- **An extra top-level module beside `lib/` + `hooks/` + `components/` must be a cohesive
  *subsystem*** — its own vocabulary, consumed by more than one page — not merely "several related
  files".

## Routes & layouts

- **Route params are read through one shared hook** (e.g. `useSlugs()`), not ad-hoc `useParams()`
  calls scattered across components.
- **A shared chrome element is mounted once, in `app/layout.tsx`.** With a header inside a
  `flex min-h-screen flex-col` wrapper, **every page's `<main>` uses `flex-1`, never
  `min-h-screen`** — the latter adds the header's height, and a scrollbar, to every page.
- **A route whose consumers are external** — `tokenURI` HTML, images, iframes, OG images — is a
  **content route**, not app data. It lives outside `api/query/`, keeps its own path, and is not
  wrapped in a hook.
- **Anything importing a library that calls `createContext` at import time is a client component.**
  A server component that touches one 500s.

## Next.js traps

- **Next.js owns `tsconfig.json`** — it rewrites the file on build. Exclude it from the formatter and
  don't hand-format it.
- **Nothing drawn over a canvas uses `next/image`.** Turning image optimization off does **not** turn
  off lazy loading; inside a portal over a canvas the IntersectionObserver can fail to ever fire and
  the image silently never loads.
- **Disabling optimization means shipping art at its render size** — `images: { unoptimized: true }`
  is a commitment, not a shortcut.
- **Dynamic-import WASM-backed clients inside their factory**, with type-only type imports. A static
  import ships megabytes in the first page chunk.

# Part 2 — Data flow

How data is fetched, mutated, and shared between server and client.

**Scope:** every query and mutation follows this part — API proxies, third-party fetches,
metadata, and anything added later. Adopt it every time data crosses the server/client boundary,
even for a one-off need. Chain reads and writes are the one carve-out and live in
`web3-chain-layer`.

## 0. The one carve-out: don't wrap what already caches

**A library that already runs on TanStack Query is used directly, never re-wrapped.** Wrapping its
hooks in another `useQuery`/`useMutation` gives you two caches that disagree. Composing several of
its hooks into one hook is fine; adding a cache on top of them is not.

- **One shared `QueryClient`** backs the app's own queries *and* any such library. Create it once in
  `components/providers/providers.tsx`; if a library mounts its own `QueryClientProvider`, hand it
  that instance so there is exactly one cache.
- The one thing react-query legitimately holds for such a library is a **one-shot SDK promise that
  has no hook of its own** (e.g. `sdk.getUsername(id)`, keyed `['username', id]`). That is not
  wrapping a hook, and it keeps `useEffect` out of it.

Everything that is not the carve-out goes through sections 1 and 2.

## 1. Data fetching (read access)

**API query routes** (`src/app/api/query/`) coupled with `@tanstack/react-query`.

- **API routes**: GET routes at `src/app/api/query/[resource]/route.ts`.
  - Return **standard JSON — direct data, no `{ success: true }` wrapper**:
    `NextResponse.json(data, { status: 200 })`.
  - Errors use HTTP status codes (200 / 404 / 500):
    `NextResponse.json({ error: error.message }, { status: 500 })`.
  - Route names are **snake_case**, plural where the resource is a collection:
    `/api/query/gas_price/`, `/api/query/post_status_counts/`.
- **Client hooks**: one hook per query in `src/hooks/queries/use-[resource].ts` (kebab-case file).
  - The hook encapsulates `useQuery` and its key. Exported names are camelCase, derived from the
    route: `useGasPrice`, `usePostStatusCounts`.
  - **Query keys start with the resource name**, then filters or an id: `['posts', filters]`,
    `['token_metadata', tokenId]`.
  - **Key segments matter for invalidation.** `useQueryInvalidate().invalidateKey(key)` matches any
    query whose key *includes* that segment — `invalidateKey(postId)` refreshes every query keyed on
    that post. Choose segments so an entity id is always one of them.
- **Prohibited: `useEffect` for data fetching.**
- **Not query routes**: routes whose consumers are external (token URIs, images, iframes, OG
  images) serve content, not app data. They live outside `api/query/` (`api/token/*`, `api/misc/*`)
  and are not wrapped in hooks.

## 2. Data mutation (internal)

**Server actions** (`src/app/actions/`) wrapped in **TanStack mutation hooks**. Server actions are
blocking — every mutation goes through this pattern so the UI never awaits one bare.

- **Server action implementation**
  - **Arguments**: a **single object argument**, with an exported interface named
    `[Name]ActionArgs` (e.g. `PublishPostActionArgs`).
  - **Return**: `{ success: boolean, error?: string, ...data }` — result fields spread directly
    (`{ success: true, post }`).
  - **Location**: `src/app/actions/[module]-actions.ts`, `'use server'` at the top.
- **Mutation hooks** — one hook file per actions file:
  | | |
  | --- | --- |
  | server action | `src/app/actions/[module]-actions.ts` |
  | hook file | `src/hooks/mutations/[module]-action-hooks.ts` |
  - Built on the generic `useActionMutation` from `@/hooks/mutations/use-action-mutation`.
  - **One `use[Name]Action` hook per server action**:
    ```ts
    export function usePublishPostAction() {
      return useActionMutation((args: PublishPostActionArgs) => publishPostAction(args));
    }
    ```
- **Component usage**: components always call the action hook — **never `fetch` a mutation route**.
  Side effects go in the `mutate` options, typically invalidation in `onSuccess` via
  `useQueryInvalidate` (`invalidateKey(post.id)`).
- **Error handling**: `useActionMutation` throws when the action returns `success: false`, and
  handles toasts and error reporting itself (§6). **Components never call `toast` for the mutation
  lifecycle.**
- **Revalidation**: **do not use `revalidatePath` / `revalidateTag`** in server actions. Refresh is
  client-side, by invalidating TanStack queries in `onSuccess`. For changes made outside the current
  client (external routes, background jobs), push events to subscribers instead — an SSE stream plus
  a provider hook lets components invalidate on the event.

## 3. Data mutation (external)

**API mutation routes**, only for consumers outside the app — webhooks, automation, background
runners, other services.

- **Location**: `src/app/api/external/[module]/[resource]/route.ts`, snake_case resource names. The
  convention for job-style endpoints is paired `[task]_run` / `[task]_get`, optionally with id
  segments (`deploy_run/[deploymentId]`).
- **Single source of truth**: an external route **never re-implements logic** — it calls the same
  service function (§4) the server action calls.
- **Error handling**: standard HTTP status codes (400, 401, 500).
- **Default is no external route.** Add one only when an external consumer actually exists.

## 4. Shared logic pattern (service layer)

To prevent duplication between internal (server actions) and external (API routes) mutations.

- **Service layer**: business logic lives in pure TypeScript functions in a module subfolder beside
  the actions file — `src/app/actions/[module]/` (e.g. `src/app/actions/publisher/deployer.ts`).
  Generic helpers go in `src/lib/`, server-only code in `src/server/` (part 1).
- **Decoupled**: service functions must not depend on Next.js specifics (`NextRequest`, `FormData`)
  and must not transitively import React client hooks.
- **Failures throw standard `Error` objects.**

**Flow**
1. **Server action** calls `serviceFunction()` → catch → `{ success: false, error: err.message }`.
2. **API route** (when one exists) calls the same `serviceFunction()` → catch →
   `NextResponse.json({ error: err.message }, { status: 500 })`.

## 5. Server action template

Exports stay compact. If the logic grows, move it to the service layer.

```ts
'use server';

export interface PublishPostActionArgs {
  postId: string;
}

export async function publishPostAction(args: PublishPostActionArgs) {
  try {
    const post = await publishPost(args); // shared service call
    // revalidatePath('/posts'); // do NOT invalidate pages like this — we invalidate queries
    return { success: true, post };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

## 6. Toasts (sonner)

Mutation feedback is centralised in `useActionMutation` using **sonner**. Components never manage
mutation toasts, and loading toasts replace blocking "waiting for server" modals.

- **Setup**: a single `<Toaster position="bottom-right" />` mounted in the providers component,
  styled with the app's `@theme` tokens so toasts match the palette.
- **Lifecycle**, per mutation:
  - `onMutate` — `toast.loading(...)` labelled with the action name plus a unique incrementing
    action id (a **module-level counter**; no store library needed). The toast `id`
    (`` `${actionName}-${actionId}` ``) makes it addressable, and its description renders a live
    `<ElapsedTimeBadge />`.
  - `onSettled` — `toast.dismiss(toastKey)`, whether the action succeeded or failed.
  - `onError` — `handleApiError` logs the action name, params and error to the console, then shows a
    `toast.error` with a close button and a 5s duration.
- **Success toasts are not shown by default** — success is communicated by the UI updating through
  query invalidation. Add an ad-hoc `toast.success` in a component only when nothing visible
  changes.
- **A long-running operation whose result arrives in stages** (a job, a transaction) needs the
  opposite shape: run the lifecycle **inside `mutationFn`** and **morph one toast id**
  `loading → success/error` instead of dismiss-then-open. Two reasons — the identifier the toast
  should display (a job id, a hash) only exists halfway through, and the toast must survive the
  observer callbacks react-query skips when a component unmounts mid-flight. `handleApiError` takes
  an optional `toastId` for exactly this.

## 7. Scaffolding a project

Reference implementations, ready to copy into `src/` (they use only `@tanstack/react-query`,
`sonner` and `cn`):

| file | reference |
| --- | --- |
| `src/hooks/mutations/use-action-mutation.tsx` | [use-action-mutation.tsx](references/use-action-mutation.tsx) — generic server-action wrapper: throws on `success: false`, loading toast, error reporting |
| `src/hooks/queries/use-query-invalidate.ts` | [use-query-invalidate.ts](references/use-query-invalidate.ts) — `invalidateKey` (segment match) / `invalidateKeys` (prefix match) |
| `src/lib/client-utils.ts` | [client-utils.ts](references/client-utils.ts) — `handleApiError` |
| `src/components/ElapsedTimeBadge.tsx` | [elapsed-time-badge.tsx](references/elapsed-time-badge.tsx) — live timer for loading toasts |

Then add on first use: `src/app/api/query/`, `src/app/actions/`, `src/hooks/queries/use-*.ts`,
`src/hooks/mutations/*-action-hooks.ts`, `src/server/`.

## Checklist

- [ ] Read goes through an `api/query/` route + one hook in `hooks/queries/`, keyed with the entity
      id as a segment.
- [ ] Write goes through a server action taking one `[Name]ActionArgs` object, returning
      `{ success, error?, ...data }`, wrapped by one `use[Name]Action` hook.
- [ ] Logic used by both an action and an external route lives in the service layer, not in either.
- [ ] No `useEffect` fetching, no `revalidatePath`, no `fetch` to a mutation route, no component-side
      mutation toast.
- [ ] Invalidation happens in `onSuccess`, by key segment.
