---
name: web3-chain-layer
description: >
  How the chain layer of a dapp front-end is built: the react-query carve-out for chain hooks,
  native bigint numerics, one address/ABI registry, contract read and write hooks, transaction
  toasts and confirmation, indexer-vs-contract reads, and signature-gated flows. Two separate
  stacks, never mixed — Ethereum/Solidity/EVM (wagmi + viem) in references/evm.md, and
  Starknet/Cairo/Dojo (Starknet Start + starknet.js v10 + Cartridge Controller + Torii) in
  references/starknet.md.
  Use when writing or reviewing any contract read, write, wallet connection, address handling or
  transaction feedback in a dapp.
---

# The Chain Layer

Everything that talks to a chain, a wallet or an indexer. App data flow (API routes, server
actions, react-query hooks) is `nextjs` (part 2); this is its **one carve-out**.

## Pick a stack, then stay in it

**EVM and Starknet are two different worlds and are never mixed in one app.**

| | Ethereum / Solidity / EVM | Starknet / Cairo / Dojo |
| --- | --- | --- |
| stack | wagmi 2 + viem 2 + ConnectKit | `@starknet-start/react` (ex `@starknet-react/core`) + starknet.js v10 + Cartridge Controller |
| addresses | 20-byte `0x…`, checksummed | felt252 `0x…`, **padded lowercase** |
| numerics | `bigint` (uint256) | `bigint` (felt/u256 split) |
| ABIs | committed artifacts / `as const` | SDK/Dojo manifest at runtime |
| indexer | events + logs, or a subgraph | Torii |
| details | [references/evm.md](references/evm.md) | [references/starknet.md](references/starknet.md) |

**Never carry a library, address type, ABI convention or wallet connector across the line.** A
project that takes another's *coding style* does not take its chain: where a ported rule names an
EVM tool, the Starknet analogue applies, and vice versa. Mark such deviations in the project's spec
so nobody "fixes" them back.

## The carve-out: chain hooks are used bare

**A chain library that already runs on TanStack Query is used directly, never re-wrapped.** wagmi
and `@starknet-start/react` both do; wrapping their hooks in another `useQuery`/`useMutation` gives
you two caches that disagree, and a "loading" that means nothing.

- **Composing several bare hooks into one app hook is fine** (a `useWeb3()` / `useController()` that
  exposes the app's vocabulary). **Adding a cache over them is not.**
- **One shared `QueryClient`** backs the chain library and the app's own queries. Create it once in
  the providers component; hand it to whichever provider the library wants it in, so there is
  exactly one cache.
- **A one-shot SDK promise with no hook of its own may live in react-query** (a username lookup, a
  fee quote), keyed like any other query. That is not wrapping a hook, and it keeps `useEffect` out
  of it.
- **Chain reads and writes do not go through API routes or server actions.** Sections 1 and 2 of
  `nextjs` part 2 are for everything that is *not* the chain.

## Numerics: native `bigint`, always

- **Every chain-scale integer is a native `bigint`** — token ids, amounts, coordinates, packed
  structs. No `bn.js`, no `BigNumber`, no `number` for anything that can exceed
  `Number.MAX_SAFE_INTEGER`.
- **A `uint256`/`u256` argument must be passed as `bigint`**, not a decimal string.
- **Bit-level packing that mirrors a contract is frozen.** When a hand-written type encodes an
  on-chain layout, changing it is a compatibility decision — pin it with unit tests asserting exact
  packed values, and treat a red pin as "the contract disagrees", not "update the fixture". Those
  pins are what makes a numeric rewrite (`bn.js` → `bigint`) safe.
- **Format for display at the edge**, never in domain code: one helper converts wei/fri to a display
  string.

## Addresses & ABIs: one registry, never hand-typed

- **One registry module owns every contract's address and ABI.** Adding a contract is an edit
  there — never an address literal in a component, and never a second list of names that drifts.
- **Addresses come from a generated/deployed source** (build artifacts, a manifest, a deployment
  JSON), keyed by chain id or network. An address a network never deployed resolves to zero and is
  dropped, not faked.
- **Address and ABI travel together**, resolved by the same lookup, so they can never describe
  different contracts.
- **Never hand-copy an ABI slice.** A second copy of the truth drifts on the next redeploy — accept
  losing type inference and carry the return type explicitly instead.
- **Cache the resolved `{ address, abi }` for reference identity.** Chain hooks memoize their
  internal contract object on `[abi, address]`; a fresh object per render rebuilds it every render.
- **One config object decides the network.** Everything chain-dependent imports it, and **nothing
  else reads `process.env` for chain config**. One network per deploy, selected by profile
  (`mainnet` / `sepolia` / a local node), with every var documented in `.env.example`.
- **Block-explorer URLs come from the chain config**, never hand-written. Beware the "current chain"
  explorer hooks when the app must link to a network it isn't connected to.

## Providers

- **The connector is built once, at module scope**, not per render — connectors reuse a global
  wallet object and warn (or misbehave) when constructed twice. Guard every `window` access inside
  it so the module SSRs without an `ssr: false` wrapper.
- **One connection API for the app**, one hook, composing the library's bare hooks. Components never
  touch the connector directly.
- **Provider order is explicit and documented**: chain config → shared `QueryClient` → wallet UI →
  app settings → toaster.
- **`isConnecting` may be yours to derive.** If the library only reports connected/disconnected, a
  returning user's page load reads as *logged out* and the UI flashes "Connect". Derive it the way
  auto-connect does (last-used connector present + connector ready), and hang every connection-state
  UI off that one flag. Make the spinner occupy the same box as what it replaces, so nothing
  reflows.
- **Anything importing the chain library is a client component** — these packages call
  `createContext` at import time, so a server component that touches one 500s.
- **Dynamic-import the WASM-backed clients** (indexer clients especially) inside their factory, with
  type-only type imports. A static import ships multi-megabyte WASM in the first page chunk.

## Reads

- **Reads are the library's read hook, used bare.** No wallet required; leave per-block watching
  **off** by default and opt in only for values that must refresh every block (balances, ownership,
  supplies, prices).
- **A read hook is named for its entrypoint and returns a *named* field** (`canPurchase`, `fee`,
  `decks`), never a bare `data`.
- **One file per contract, one hook per entrypoint** — and only the entrypoints the app actually
  calls. A new contract is a new file plus a name in the registry.
- **Token balances come from the indexer, not from contract reads.** A write mints; the indexer's
  subscription notices. Never poll a balance through a contract hook.
- **"Loading" means "not known yet", and it covers reconnects.** Empty balances are *not* "owns
  nothing" until loading is false — and what follows from that is a **caption, not a layout**:
  render the full layout from the first frame and swap a spinner where the count goes, so the page
  doesn't jump when the answer lands.

## Writes

- **A write is not confirmed when the wallet accepts it.** Hooks that resolve on acceptance cannot
  tell a landed transaction from one that reverted. Always **send, then await the receipt**, and
  throw the revert reason.
- **Compile calldata from the ABI**, never assemble it by hand.
- **One entrypoint is not always one call.** An approval or a randomness request rides in front of
  the call **in the same transaction**, so the toast, the receipt and the revert stay one thing. A
  value such a pre-call needs (a fee) is fetched **fresh**, not read from the cached read hook — a
  stale fee is an approval for the wrong amount.
- **Invalidation is the write hook's job**, not the component's — only it knows which views its
  write moved. Note that a generic "invalidate by key segment" helper may not reach chain queries at
  all if the library keys them with a single object; use the library's own invalidation.
- **A write whose result the user waits to *see* needs an `indexing` phase.** The receipt lands
  seconds before the indexer does; a flow hook ends when the new state actually appears, not when
  the transaction confirms.

## Transaction toasts

Same look as the app's mutation toasts (`nextjs` § Toasts), with three deliberate differences:

- **The lifecycle lives inside `mutationFn`**, not `onMutate`/`onSettled` — the hash only exists
  halfway through, and the toast must survive the observer callbacks react-query skips when a
  component unmounts mid-transaction.
- **One toast morphs at one id**, `loading → success/error`, instead of dismiss-then-open, so a call
  never leaves two toasts behind. Show the hash while pending.
- **Success *is* shown**, unlike server actions — a transaction that changes nothing on screen still
  has to say it landed.

Label it `contract::entrypoint()` with a live elapsed-time badge.

## Signature-gated flows

When the server authorises an action rather than trusting the client:

- **Server-only code holds the key** and never leaves `src/server/`.
- **Nonces are HMAC tokens with a TTL**, not indefinitely replayable blobs. Mint a fresh one in the
  server component and pass it to the client.
- **The signed-message format is byte-for-byte compatible with the contract's verification** — it
  reproduces the on-chain encoding exactly. **Never change a message format**; a change invalidates
  every signature the chain will accept.
- **Validation helpers are shared** between client and server, and verification is async.
- **Proxy routes that fetch user-supplied URLs are SSRF-guarded** (public http(s) only).

## Testing & benches

- **A contract bench page** — one section per contract, each read's live value and a button per
  write — is the natural first consumer of a new hook, and lets a toast be watched without a game
  around it. Keep it unlinked, gate writes on connection plus the matching `can_*` view, and delete
  sections as real pages take them over.
- **Its writes are real and cost real money.** Point the profile at a testnet to exercise them.
- **Pure domain math is unit-tested; wallet flows are a manual checklist.** Automate what renders
  without a wallet (public routes, a smoke suite); keep connect / sign / mint / purchase as a
  written manual pass run before and after risky changes.

## Version discipline

- **Pin the wallet stack and note the versions**, in the project's own docs — these APIs differ
  sharply between releases, and a wallet-UI package often caps the chain library's major version.
- **A published SDK lags its source checkout.** Bundled manifests can be older than the deployed
  world (an entrypoint added later may be uncallable), and generated constants can be *ahead* of the
  ABI they describe. **Treat the manifest as the real list** and re-check both after a bump.
- **Don't `link:` a local SDK checkout** — bundlers refuse to resolve a module whose real path
  escapes the project root. Bump the catalog when a release lands.
- **Publish workspace packages with `pnpm publish`, not `npm publish`** — only pnpm resolves
  `catalog:` into real versions; npm ships the literal string and consumers resolve nothing.
