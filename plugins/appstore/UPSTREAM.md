# Upstream

The skills in this plugin (`appstore`) are copied unchanged from
[rorkai/app-store-connect-cli-skills](https://github.com/rorkai/app-store-connect-cli-skills)
(MIT, © 2026 Rudrank Riyam; see [`LICENSE`](LICENSE)) at commit `4b496c5` (2026-10-13).
They drive the [`asc` CLI](https://github.com/rorkai/app-store-connect-cli) (`brew install asc`).

- **Copied:** `asc-cli-usage`, `asc-id-resolver`, `asc-xcode-build`, `asc-signing-setup`,
  `asc-build-lifecycle`, `asc-testflight-orchestration`, `asc-metadata-sync`, `asc-release-flow`,
  `asc-submission-health`, `asc-shots-pipeline`, `asc-screenshot-resize`, `asc-app-create-ui`.
- **Not copied** (out of scope for a paid app with no IAP, ads or macOS target): ad-hoc
  distribution, analytics reports, Apple Ads, ASO audit, crash triage, in-app events, metadata
  localization by LLM, notarization, PPP pricing, RevenueCat sync, subscription localization, Wall of
  Apps, What's New writer, workflows. Copied skills still mention `asc-ad-hoc-distribution`,
  `asc-in-app-events` and `asc-screenshot-no-alpha`; those are not available here.
- **Edits:** none. Never edit a copied skill in place. Fix it upstream, or re-copy at a newer
  commit and update the commit above. Project-agnostic glue that sits on top of these lives in the
  `ios` plugin: `ios-xcode-cli` and `ios-release-playbook`.

**Sync:** `git clone --depth 1` the upstream repo into a scratch folder, re-copy the listed
skills over `skills/`, diff, update the commit and date here, and bump `version` in
`.claude-plugin/plugin.json`.
