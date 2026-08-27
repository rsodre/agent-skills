# EVM stack — Ethereum / Solidity / wagmi + viem

The Ethereum side of `web3-chain-layer`. **Nothing here applies to a Starknet app** — see
`starknet.md` for that stack, and never mix the two in one project.

## The stack

- **wagmi 2** — React hooks for accounts, reads, writes, events. Runs on TanStack Query internally,
  so it is the carve-out: used bare, never re-wrapped.
- **viem 2** — the low-level client, both in the browser and **server-side** (`createPublicClient`)
  for API routes, server actions and metadata rendering. It replaces `ethers`, `web3.js`,
  `alchemy-sdk` and `eth-crypto` — one library across both sides.
- **ConnectKit** — the wallet-connection UI. It caps the wagmi major it supports; check before
  bumping wagmi.
- **`bigint` everywhere.** `bn.js`/`BigNumber` are removed, not wrapped.

Provider order:

```
layout.tsx (server component)
└── providers.tsx ('use client')
    WagmiProvider → QueryClientProvider → ConnectKitProvider → SettingsProvider (+ <Toaster />)
```

One shared `QueryClient` backs wagmi and the app's own queries.

## Chains & environment

- **One registered chain per deploy**, chosen by an env var (`mainnet` | `sepolia` | a local node).
  A `lib/chains.ts` maps it to the viem chain plus its transport; nothing else reads the var.
- Local development against Ganache/Anvil is a chain like any other (Ganache: chain id 5777 at
  `http://127.0.0.1:7545`).
- **WalletConnect needs a project id**; injected wallets work without one. Document it in
  `.env.example` — a missing value is a silent "no QR connections".

## Contracts registry

- **ABIs + deployed addresses are committed as JSON artifacts** (Truffle/Hardhat style, with a
  `.networks` map keyed by chain id).
- **One registry module** imports those artifacts, flattens `.networks` to `{ chainId: address }`,
  types the ABIs as viem's `Abi`, and marks interface-only ABIs. **Adding a contract happens here
  and nowhere else.**
- A `useContract(name)` hook resolves a registered contract to `{ address, abi }` for the active
  chain.
- Exclude the artifacts directory from the formatter/linter — it is generated, not authored.

## Read & write wrappers

Thin app-level wrappers over wagmi keep call sites uniform:

- **`useContractRead(contractName, functionName, args, options)`** over wagmi's `useReadContract`.
  - **Reads default to `static: true`** — fetched once. Pass `static: false` for anything that must
    refresh per block: balances, ownership, supplies, prices.
  - **uint256 args must be `bigint`.**
- **`useContractWrite(...)`** over `useWriteContract` **+ `useWaitForTransactionReceipt`**. The
  receipt wait is not optional: `useWriteContract` resolves when the wallet accepts, which cannot
  distinguish a landed transaction from a reverted one.
- **Events**: `useWatchContractEvent` refreshes derived state (e.g. a `Minted` listener invalidating
  the owned-token views). Prefer an event listener over polling.

## Domain layer

- **Hand-written types mirror the Solidity structs** (coordinate systems, tile/terrain enums, packed
  ids). Their bit-level semantics are frozen; a uint256 lane packing must stay byte-identical to the
  contracts.
- **Unit-test the packing.** A Vitest suite asserting exact packed `bigint` values is what makes a
  numeric rewrite safe — a red pin means the contract disagrees.
- **Static/offline data** (maps, metadata the app shouldn't read on-chain every time) goes behind one
  adapter module with a **cached-first, on-chain-fallback** unifier, so callers never choose the
  source.

## Server-side (viem + signatures)

- **`src/server/` holds anything with a secret** — the signer's private key never leaves it.
- **Nonces are HMAC + TTL tokens** (e.g. 24h), minted in the page's server component and passed to
  the client. An encrypted-but-indefinite nonce is replayable forever; don't.
- **`privateKeyToAccount` signs EIP-191 messages.** The message builder reproduces Solidity's
  `abi.encode(address, uint256)` → `keccak256` **byte for byte** — on-chain ECDSA compatibility
  depends on it, so **never change a message format**.
- **Validation helpers are shared** client/server (`validateSignedMessage` is async — viem's
  `verifyMessage`).
- **The whole flow is server actions**, not HTTP sign routes: one action per operation over a
  service layer (`nextjs` §4), called from `hooks/mutations/`.
- **A server-side viem `publicClient`** replaces vendor SDKs for reads in routes and actions.
- **Metadata/image proxies are SSRF-guarded** — public http(s) only.

## Token-facing routes

`tokenURI` HTML, images and iframes are **content routes**, not `api/query/` routes: external
consumers (marketplaces, wallets) fetch them, they are not wrapped in hooks, and they keep their own
paths.

## React 19 notes

- No `defaultProps` on function components (removed) — use ES default parameters.
- `useRef()` requires an initial argument: `useRef<T>(null)`.
- Older wallet-UI packages may still declare React 17/18 peers and warn on install while working
  fine; a package that calls `findDOMNode` does not.
