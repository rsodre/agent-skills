---
name: ios-release-playbook
description: >
  The end-to-end order for taking an iOS app from nothing to "Ready for Sale", run by an agent with
  the asc CLI: one-time account and API-key setup, bundle id and capabilities, the app record,
  metadata kept as code in asc's canonical layout, pricing, availability, age rating, App Privacy,
  review details, screenshots, archive → TestFlight with a tag as the release identity, promotion
  without rebuilding, readiness validation, submission and manual release — with every step that
  genuinely needs a person marked. Use when planning or running a first App Store release, a
  TestFlight pipeline, or a resubmission, and to route each step to the right `appstore` skill.
---

# iOS release playbook

This skill decides the **order** and the **ownership**. The commands live in the `appstore`
plugin's skills, which wrap the [`asc` CLI](https://github.com/rorkai/app-store-connect-cli). The
local build loop is in [`ios-xcode-cli`](../ios-xcode-cli/SKILL.md). Duo screenshots and the
"optimised" badge are in [`iphone-duo-testing-launch`](../iphone-duo-testing-launch/SKILL.md).

> **Status:** drafted 2026-10-14 from the asc docs and a shipped agent-run project. Lines marked
> **⚠︎** have not been run end to end yet; whoever runs one first fixes it here and removes the mark.

## Rules

- **Dry run, then confirm.** Every mutating `asc` command that offers `--dry-run` is run with it
  first, and `--confirm` is added only when the plan matches the intent.
- **IDs, never names, in mutations.** Resolve them once (`asc-id-resolver`) and keep them in
  the repo's release manifest.
- **One process owns an interactive Apple sign-in.** Web-session logins send a 2FA code. Never start
  a second login while one is waiting for a code (`asc-cli-usage`).
- **A build is identified by its App Store Connect build id**, recorded on an annotated git tag.
  Promotion re-checks that identity and **never rebuilds**.
- **Metadata is code.** It is pulled once, edited in the repo, validated in CI, and pushed by an
  explicit command, never as a side effect of a build.
- **Never create a second review submission** for a version that already has one. Inspect it, then
  continue it (`asc-release-flow`).

## Who does what

| Step | Owner | Why a person, if one |
|---|---|---|
| Apple Developer Program, Paid Apps agreement, tax, banking | **Person** | Legal; no API |
| First API key | **Person**, or agent after one web sign-in | Created in App Store Connect → Users and Access → Integrations, or `asc web api-keys create` once a person has completed `asc web auth login` (2FA) |
| Bundle id, capabilities, certificates, profiles | Agent | `asc-signing-setup` |
| App record | Agent driving the browser, **person signed in** | No public API (`asc-app-create-ui`) |
| App Privacy answers | Agent drafts; publish needs a **web session** | Not in the public API (`asc-submission-health` → app privacy) |
| DSA trader status (EU) | **Person** | Web UI only |
| Metadata, pricing, availability, age rating, review details, screenshots | Agent | `appstore` skills |
| Build, TestFlight, submission, release | Agent | — |
| Device testing, judging the build, App Review replies | **Person** | Taste and correspondence |

One web sign-in by the person (`asc web auth login --apple-id …` with their 2FA code) unlocks the
web-only steps for that session. Reuse the cached session; check it with `asc web auth status`.

## The order

### 0. Tooling (once per machine)

```bash
brew install asc
asc auth login --name "<app>" --key-id "$KEY_ID" --issuer-id "$ISSUER_ID" --private-key ./AuthKey_$KEY_ID.p8
asc auth status && asc apps list --output table
```

Then move the `.p8` out of the repo (keychain storage is the default). CI uses environment
credentials instead: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_PRIVATE_KEY_B64` as secrets, with the
`rudrankriyam/setup-asc` action (`asc-cli-usage`).

### 1. Identity

1. `asc bundle-ids create --identifier "com.example.app" --name "App" --platform IOS`, then enable
   any capabilities the entitlements need (iCloud, push…) → `asc-signing-setup`.
2. App record → `asc-app-create-ui` (name ≤ 30 characters, SKU, primary language). Record the app
   id in the release manifest.
3. In the project: bundle id, team, automatic signing, `ITSAppUsesNonExemptEncryption` (removes the
   export-compliance question) → [`ios-xcode-cli`](../ios-xcode-cli/SKILL.md) §1.

### 2. Metadata as code

Use asc's canonical layout, so `asc metadata validate/push` and `asc release stage` read it
directly:

```
app-store/
├── release.yaml                      # app id, platform, version, review contact, release type (yours)
├── metadata/
│   ├── app-info/en-US.json           # name, subtitle, privacyPolicyUrl
│   └── version/<version>/en-US.json  # description, keywords, supportUrl, marketingUrl, promotionalText, whatsNew
├── privacy.json                      # asc web privacy schema
└── screenshots/<locale>/<display>/   # ordered PNGs
```

- Start from `asc metadata pull --app "$APP_ID" --version "1.0" --platform IOS --dir app-store/metadata`.
- CI runs `asc metadata validate --dir app-store/metadata` on every change to `app-store/`.
- Apply: `asc metadata push … --dry-run`, then without `--dry-run` → `asc-metadata-sync`.
- Copyright: `asc versions update --version-id "$VERSION_ID" --copyright "2026 Example"`.

### 3. Commerce and rating

- **Availability** must exist before pricing edits: `asc pricing availability create --app "$APP_ID"
  --territory "USA,…" --available true --available-in-new-territories true`. If Apple rejects the
  public-API bootstrap, use `asc web apps availability create` → `asc-submission-health`
  (readiness repairs).
- **Price:** find the price point for the base territory, then
  `asc pricing schedule create --app "$APP_ID" --price-point "$POINT_ID" --base-territory USA --start-date <today>`
  ⚠︎ (look up the point id with `asc pricing --help`).
- **Age rating:** `asc age-rating view`, then `asc age-rating edit` with every answer explicit.
- **Review details:** `asc review details-update --id "$DETAIL_ID" --contact-email … --contact-phone …
  --notes "…"`. Notes are at most 4000 characters, and demo credentials only when review needs them.
- **App Privacy:** keep `privacy.json` true to the binary and its SDKs; `asc web privacy plan`,
  `apply` and then `publish` (web session).

### 4. Screenshots

Generate them from the simulator (`asc-shots-pipeline`: build, launch, drive, capture, frame),
resize and validate (`asc-screenshot-resize`), then upload with the metadata. For iPhone Duo,
include the Duo display set to earn the "optimised for iPhone Duo" badge.

### 5. Build → TestFlight

1. Version and build number at upload time: `asc xcode version edit --version "1.0" --next-build-number --app "$APP_ID" --platform IOS`.
2. Archive and export: `asc xcode archive …` then `asc xcode export … --xcodebuild-flag=-allowProvisioningUpdates` → `asc-xcode-build`.
3. Upload and wait: `asc builds upload --app "$APP_ID" --ipa .asc/artifacts/App.ipa --wait`, or
   `asc publish testflight … --group "$GROUP_ID" --wait` → `asc-testflight-orchestration`.
4. **Tag it:** `git tag -a "testflight/<build-number>" -m "ASC build <BUILD_ID>"` on the exact commit, and push the tag.
   That tag is the release identity from here on.
5. Watch processing and clean up old builds → `asc-build-lifecycle`.

### 6. Validate → submit

```bash
asc release stage --app "$APP_ID" --version "1.0" --build-id "$BUILD_ID" --metadata-dir app-store/metadata --dry-run
asc release stage --app "$APP_ID" --version "1.0" --build-id "$BUILD_ID" --metadata-dir app-store/metadata --confirm
asc validate --app "$APP_ID" --version "1.0" --platform IOS --strict --output table
asc versions update --version-id "$VERSION_ID" --release-type MANUAL
asc review submit --app "$APP_ID" --version "1.0" --build-id "$BUILD_ID" --dry-run
asc review submit --app "$APP_ID" --version "1.0" --build-id "$BUILD_ID" --confirm
```

Any blocker that `asc validate` reports → `asc-submission-health`, then back here. Report the app,
version, build and submission ids, and the command that monitors the submission.

### 7. After review

- Rejection or a stuck submission → `asc-submission-health`. A person reads and answers App Review.
- Approved, with manual release: `asc versions release --version-id "$VERSION_ID" --confirm` at the
  chosen moment.

## CI shape (GitHub Actions on macOS runners)

| Workflow | Trigger | Does |
|---|---|---|
| `ci` | every push and PR | package tests, app compile check, content and metadata validation, smoke harness; uploads evidence |
| `testflight` | manual | §5, then pushes the tag; outputs the build id |
| `promote` | manual, with a tag | checks the tag's build id, then distributes externally or stages and submits (§6) without rebuilding |
| `metadata` | manual | `asc metadata push` and the commerce edits in §3 |

Runners need the Xcode version the app requires; select it with `sudo xcode-select -s`, and fail
early if it is missing. Secrets: the three `ASC_*` values only. Never upload the `.p8` as a file
artifact.

## Done when

- [ ] Every person-owned step in the table is done or scheduled, and nothing else waits on a person.
- [ ] `app-store/` validates in CI; pushing it is one explicit command.
- [ ] A TestFlight build carries a tag with its build id, and promotion never rebuilds.
- [ ] `asc validate --strict` is clean before `asc review submit --confirm`.
