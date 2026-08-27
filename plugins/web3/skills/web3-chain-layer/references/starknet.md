# Starknet stack — Cairo / Dojo / Starknet Start + Cartridge Controller + Torii

The Starknet side of `web3-chain-layer`. **Nothing here applies to an EVM app** — see `evm.md` for
that stack, and never mix the two in one project.

**Current as of 2026-08: `@starknet-react/core` is superseded by Starknet Start
(`@starknet-start/react`), and starknet.js is on v10.** Both moves have breaking changes that reach
this layer — see [Migrating to Starknet Start](#migrating-to-starknet-start) and
[starknet.js v10](#starknetjs-v10) below. A project still on the old packages is on the *previous*
generation: port it rather than writing new code against it.

Reference docs:
- Migration guide: <https://start.starknet-react.com/docs/migrating-to-starknet-start>
- Starknet Start docs: <https://start.starknet-react.com/>
- starknet.js v9 → v10 migration:
  <https://github.com/starknet-io/starknet.js/blob/develop/www/docs/guides/migrate.md>

## The stack

- **`@starknet-start/react`** — React hooks for account, reads and writes (formerly
  `@starknet-react/core`). Runs on TanStack Query internally, so it is the carve-out: used bare,
  never re-wrapped. Its siblings are **`@starknet-start/chains`** (chain definitions),
  **`@starknet-start/providers`** (RPC provider factories) and **`@starknet-start/explorers`**
  (explorer URL helpers).
- **starknet.js v10** — `CallData`, `Contract`, felt helpers, and `waitForTransaction` **on
  `account.provider`, not on `account`** (v10 breaking change).
- **Cartridge Controller** — the wallet. One `ControllerConnector`, built **once at module scope**
  (it reuses `window.starknet_controller` and warns if constructed twice); every `window` access
  inside is guarded, so the module SSRs without an `ssr: false` wrapper.
- **Torii** — the Dojo indexer: balances, token metadata, entity subscriptions.
- **Addresses are padded lowercase felts** (`bigintToAddress`) — that is the form Torii expects, and
  comparing an unpadded address to a padded one silently fails.

Provider order: `providers.tsx` creates the one `QueryClient` and hands it to `StarknetConfig`'s
**`queryClient` prop** — it mounts the `QueryClientProvider` itself, so there is one cache, shared
with the app's own queries.

```tsx
'use client';
import { mainnet, sepolia } from '@starknet-start/chains';
import { publicProvider } from '@starknet-start/providers';
import { StarknetConfig } from '@starknet-start/react';

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      chains={[sepolia, mainnet]}
      provider={publicProvider()}
      connectors={[controllerConnector]}   // module scope — see below
      queryClient={queryClient}            // the app's one client
      defaultChainId={PROFILE.chainId}     // must be one of `chains`
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
}
```

`StarknetConfig` takes `chains`, `provider`, `connectors`, `explorer`, `queryClient`, `autoConnect`
and `defaultChainId` (the active chain when no wallet is connected; it must appear in `chains`).

## Migrating to Starknet Start

<https://start.starknet-react.com/docs/migrating-to-starknet-start>

```sh
npm uninstall @starknet-react/core
npm add @starknet-start/react @starknet-start/chains @starknet-start/providers starknet @tanstack/react-query
```

| was | now |
| --- | --- |
| `@starknet-react/core` | `@starknet-start/react` |
| chain constants from core | `@starknet-start/chains` |
| provider factories from core | `@starknet-start/providers` |
| explorer helpers from core | `@starknet-start/explorers` |

- **Hook names carry over.** `useAccount`, `useConnect`, `useReadContract`, `useSendTransaction`,
  `useContract`, `useNetwork`, `useProvider`, `useExplorer`, `useInvalidateOnBlock` and the rest keep
  their names — the migration is imports and setup, not a rewrite of call sites. Verify each hook's
  return shape against the docs as you port; do not assume the old fields.
- **Wallet discovery is automatic**, through `get-starknet`: standard injected wallets no longer need
  a hand-built `InjectedConnector`. `StarknetConfig` wraps `GetStarknetProvider`, and
  `@starknet-io/get-starknet-ui` supplies a connection modal if you want one. `useConnect` still
  returns `connectors` + `connect` for a custom wallet list.
- **Built-in wallets are imports**: `readyWallet`, `braavos` from
  `@starknet-io/get-starknet-core/wallets`. A non-standard injected wallet is
  `new StarknetInjectedWallet(window.starknet_myWallet)` (`id` required; `name`/`icon` optional).
- **A custom connector is still a connector.** Cartridge Controller needs `@cartridge/connector` +
  `@cartridge/controller`, and is passed in `connectors` — the module-scope rule below is unchanged.

## starknet.js v10

<https://github.com/starknet-io/starknet.js/blob/develop/www/docs/guides/migrate.md>

**The one that hits this layer: `Account` no longer extends `Provider`** — it composes one. Every
chain query goes through `account.provider`:

```ts
// v9
await account.waitForTransaction(hash);
await account.getChainId();

// v10
await account.provider.waitForTransaction(hash);
await account.provider.getChainId();
```

`account.execute(...)` is unchanged, so the write rule becomes **`account.execute` then
`account.provider.waitForTransaction`**.

The rest, in the order you are likely to hit them:

- **No global singletons.** `defaultProvider` / `defaultPaymaster` are gone — `await RpcProvider.create()` or `new PaymasterRpc()`.
- **`getStorageAt` returns an object** — read `result.value`, not the bare felt.
- **`stark.compressProgram` / `decompressProgram` are async** (native Compression Streams API).
- **`getSimulateTransaction` returns an object**, not an array — iterate
  `result.simulated_transactions`.
- **felt252 range is validated**: an out-of-range value now throws instead of being accepted
  silently, and `CairoFelt252.toApiRequest()` returns decimal rather than hex.
- **Plugins replaced ts-mixer**: `StarknetId` → `StarknetIdImpl`, imported from the package root
  rather than a nested extensions path. `fastExecute` is a plugin, on by default — re-add it
  explicitly (`plugins: [fastExecute()]`) if you disable plugins.
- **RPC namespaces renamed**: `RPCSPEC010`/`RPC010` → `RPCSPEC0103`/`RPC0103` (or `RPC0102`).
- **`provider.fetch()` is explicitly async.**

## Profiles

- **One network at a time, selected by profile** (`mainnet`, `sepolia`). A profile table derives
  `chainId`, contract addresses and tokens; **every field is a single value** — don't split fields
  into `{ starknet, appchain }` shapes unless the app really bridges to an appchain.
- **A profile carries `networkId`, not a manifest.** Whatever needs a manifest or an ABI asks the
  SDK: `getManifest({ networkId })`.
- **One `config.ts` exports the profile**; nothing else reads `process.env` for chain config.
- **Explorer URLs come from the chain's own config** (`chain.explorers.voyager` via
  `@starknet-start/explorers`' `VoyagerExplorer`), never hand-written. **Avoid the `useExplorer` hook** when the app must link to
  a network it is not connected to — it ties every link to the connected chain.
- **Anything importing `@starknet-start/react` is a client component**: it ships as one module that
  calls `createContext` at import time, so a server component touching it 500s.

## Torii client

- **One lazily-created `ToriiClient`**, with the `import()` kept **dynamic inside the factory** and
  the type import `type`-only. `@dojoengine/torii-client` re-exports `torii-wasm`, which
  instantiates a ~2.7MB WASM binary at import time — a static import ships it in the first page
  chunk.
- **One subscription for the app**: page the balances for the connected account, then stream
  updates. Read it through app hooks (`useTokenBalances()` / `useCoinBalance()` / `useTokenIds()`),
  never a second query layer.
- **Torii leaves `token_id` unset for ERC-20s** — that is what splits ERC-20 from ERC-721 balances.
- **Read the address from the app's connection hook, not `useAccount`**, so a reconnect still counts
  as "not known yet".
- **Collection metadata is the `token_id IS NULL` row.** It is account-independent — mount its
  provider *outside* the balances provider, whose effect is keyed on the address, or every connect
  re-fetches every collection.
- **Collection metadata is inconsistent in the wild**: `background_color` may be `#e9672b`, a bare
  `010813`, or absent, and some contracts have no metadata row at all. Normalise both forms, drop
  the rest, and **never assume a colour is there** — carry a fallback in your own config, applied on
  the way *out* of the provider so the cache stays keyed on the address set. Strip inlined data-URI
  images before caching (20–50KB each). Torii returns both `metadata` and `token_metadata`; take the
  first that parses to a non-empty object.

## Addresses: two sources, never hand-typed

- **The game's own contracts come from the Dojo manifest**; everything else lives in a
  **`contracts.json` at the repo root** — the same file the indexer reads, so the app's token list is
  exactly what Torii has balances for. Adding tokens means editing it and redeploying the indexer:
  **one file, two consumers.**
- **One module is the only reader of that file's shape**; every consumer goes through it, including
  the ordering rule (a main game leads every list, as a stable partition — nothing downstream sorts
  by game again).
- **A URL-facing id in that file is an API.** Renaming a collection slug breaks every link to it.
- Fields your client adds (a fallback colour, an art aspect) are ignored by the indexer — validate
  them in your own check script, since nothing else ever reads the file for errors.
- **No hardcoded list of token names anywhere** — it drifts.

## Connection

- **One connection hook composes the bare hooks** — connect, disconnect, open the wallet, username.
- **Check whether `isConnecting` is real before trusting it.** In some releases `useAccount().status`
  only reports `connected | disconnected` and `isConnecting`/`isReconnecting` are hardcoded `false`,
  so a page load reads as *logged out* and the app flashes "Connect" at a returning player. Verify
  against the installed version; where it is not reported, derive it. Ask what auto-connect asks: is `localStorage.lastUsedConnector` ours, and is
  the connector `ready()`? An in-flight `undefined` counts as connecting. Consequence to accept: if
  `ready()` says yes and the connect never lands, it stays connecting.
- **A username → address lookup is a one-shot SDK promise**, so it belongs in react-query. Two
  traps: the lookup matches **exactly**, so lowercase the query; and **report no address while it is
  settling** — the previous result is still cached, and acting on it mints to the wrong account.
- The Controller `preset` supplies theme and published policies. Its optional toaster stays unmounted
  unless you need it (importing package CSS needs a reason), and `ControllerOptions.tokens` may be a
  fixed union rather than arbitrary addresses — `toriiUrl` is what surfaces them.

## Contract calls

**Use the SDK's ABIs and pure helpers; drive the calls yourself.** No `createSystemCalls`, no
`@dojoengine/sdk` call context — those assume a context the app doesn't mount.

```
dojo/contracts.ts            getContract(name) → { address, abi }; one-shot call helper
dojo/calls.ts                the approval / VRF calls that ride in front of a system call
hooks/contracts/
  use-contract-read.ts       useContractRead<T>, useInvalidateContractReads
  use-contract-mutation.tsx  send, await the receipt, toast
  use-<contract>.ts          one hook per entrypoint
```

- **One file per contract, one hook per entrypoint.** A hook is named for its entrypoint and returns
  the result spread plus one **named** field — never a bare `data`.
- **ABIs come from the manifest at runtime, never vendored**
  (`getContractByName(getManifest({ networkId }), NAMESPACE, name)`), so address and ABI can't
  describe different contracts. **Cache the result for reference identity** — `useReadContract`
  memoizes its `Contract` on `[abi, address]`, so a fresh object per render rebuilds it every render.
  - The price is no type inference (abi-wan-kanabi infers only from an `as const` literal). Carry the
    return type on your own `useContractRead<T>` wrapper. **Don't hand-copy ABI slices to get
    inference back** — a second copy of the truth that drifts on the next redeploy.
- **Reads: `useReadContract`, bare, `parseResponse: true`** — a struct arrives as an object, an enum
  as a `CairoCustomEnum`, an `Option` as a `CairoOption` (`.isSome()`, so "none" is not a zero). No
  wallet needed; `watch` off.
- **Writes are NOT `useSendTransaction`** — it resolves when the wallet *accepts*, so a toast on it
  can report success on a transaction that reverted. Do `account.execute` then
  **`account.provider.waitForTransaction`** (v10 moved it off `Account`; `PRE_CONFIRMED` counts, and
  is seconds ahead of `ACCEPTED_ON_L2`) and throw the revert reason.
- **A pre-call rides in the same transaction** — an ERC-20 approval or a VRF request via a `before`
  hook, so toast, receipt and revert stay one thing. It is async because a fee must be fetched
  first, through the **one-shot** call helper and deliberately **not** the cached read hook: a stale
  fee is an approval for the wrong amount. Drop `undefined` entries.
- **Calldata is compiled from the ABI** — `new CallData(abi).compile(...)` knows every Cairo type, so
  a struct or enum argument costs an `args` mapper and nothing else (enums via `makeCustomEnum`).
  Omitting `args` skips the ABI lookup entirely, which is sometimes the only reason a
  newer-than-the-manifest entrypoint is callable at all.
- **Invalidation is the entrypoint hook's job** (`onSuccess: () => invalidateContractReads(...)`). A
  generic invalidate-by-key-segment helper **cannot reach these** — starknet-react keys a read as a
  single object, so a key-segment match never hits one.
- **Balances come from Torii, never from a contract poll.** A write mints; the subscription notices.
  A write the player waits to *see* is a flow with an `indexing` phase — the receipt lands seconds
  before the indexer does.

## SDK caveats (Dojo / game SDKs)

- **The npm release lags the local checkout, and the gap reaches real code.** Bundled manifests can
  be older than the deployed world (an entrypoint added later, *with* arguments, would be
  uncallable), and generated `constants` can be *ahead* of the ABI they describe (extra enum
  variants that fail to compile). **Treat the manifest's list as the real one**, and re-check both
  after a bump. Check the published `.d.ts` before importing a newly added symbol.
- **Don't `link:` the local checkout** — Turbopack refuses to resolve a module whose real path
  escapes the project root, and every SDK import fails. Bump the catalog when a release lands.
- **Publish with `pnpm publish`, not `npm publish`** — npm ships the literal `"catalog:"` string into
  the published manifest and consumers resolve nothing.
- An SDK's `/hooks` or Dojo-context entry points assume the full SDK context; if you talk to Torii
  directly, they are not for you.

## Cairo-side notes

- **Indentation is 4 spaces for Cairo** (and Python), 2 for TS/JS.
- Generated bindings (`dojo/bindings/**`) are generated: excluded from the formatter, never
  hand-edited.
- A repo may carry a Torii deployment (`contracts.json`, `railway.toml`, `torii/`) with no Cairo code
  of its own — check `package.json` before assuming a build, deploy or test command exists.
