---
name: ios-xcode-cli
description: >
  The local build–test–run loop for an iOS app, driven entirely from the command line by an agent:
  project shape that keeps the pbxproj out of merges (thin app target, synchronised folders, local
  Swift packages), `swift test` and `xcodebuild` build/test (including a single test), reading
  `.xcresult`, simulators the agent owns (never the shared default), the iPhone Duo simulator,
  install/launch/screenshot/video/logs, physical devices with `devicectl`, signing for local runs
  with an App Store Connect API key, parallel sessions without DerivedData collisions, and an in-app
  smoke harness. Use when building, testing, running or screenshotting an iOS app from a terminal or
  CI, or setting up a new iOS project for agents.
---

# iOS from the command line

The loop an agent runs dozens of times a day. Archiving, exporting, uploading and App Store work
are in [`ios-release-playbook`](../ios-release-playbook/SKILL.md) and the `appstore` plugin. Duo
device facts are in [`iphone-duo`](../iphone-duo/SKILL.md).

> **Status:** drafted 2026-10-14 from Apple's tools, the `asc` CLI docs and a shipped agent-run
> project. Lines marked **⚠︎** have not yet been run on Xcode 27.1; whoever runs one first fixes it
> here and removes the mark.

## 1. Project shape: keep the pbxproj boring

Agents merge often, and `project.pbxproj` is where merges go wrong. Keep it nearly static:

- **One thin app target**: the `@main` entry point, Info.plist, asset catalog, `.xcstrings`,
  entitlements. Everything else lives in **local Swift packages** (`Packages/<Module>/`) added to the
  project once.
- **Synchronised folders** (Xcode 16+): the app target's folder is a *folder reference that stays
  in sync*, so adding a file never touches the pbxproj. Check for `PBXFileSystemSynchronizedRootGroup`
  in the pbxproj.
- **Creating the project without the Xcode UI ⚠︎:** `xcodebuild` has no "new project" command.
  Either generate it once with XcodeGen (`brew install xcodegen`; a `project.yml` with the app
  target as a synced folder and the local packages), commit the generated `.xcodeproj`, and delete
  `project.yml`; or copy a known-good minimal project and rename it. After that, the pbxproj changes
  only when a package or a build setting is added.
- **Shared scheme** committed under `xcshareddata/xcschemes/`, with tests attached, so CI and every
  session see the same scheme.
- Settings that matter from day one: `PRODUCT_BUNDLE_IDENTIFIER`, `DEVELOPMENT_TEAM`,
  `CODE_SIGN_STYLE = Automatic`, `IPHONEOS_DEPLOYMENT_TARGET`, `TARGETED_DEVICE_FAMILY`
  (`1,2` = universal), `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` (set at upload time, see the
  release playbook), and `ITSAppUsesNonExemptEncryption = NO` in Info.plist when the app uses only
  exempt encryption.
- Discover what a project has: `xcodebuild -list -project App.xcodeproj` and
  `xcodebuild -showBuildSettings -project App.xcodeproj -scheme App | grep -E 'BUNDLE|TEAM|VERSION'`.

## 2. Test packages first: they're the fast loop

Pure logic belongs in packages with no UI, which test on the host Mac in seconds without a
simulator:

```bash
swift build --package-path Packages/Core
swift test  --package-path Packages/Core
swift test  --package-path Packages/Core --filter CoreTests.ResolverTests            # one class
swift test  --package-path Packages/Core --filter 'CoreTests.ResolverTests/testP1'   # one test
swift test  --package-path Packages/Core --parallel
```

Swift Testing (`@Test`) and XCTest both run under `swift test`; `--filter` matches either.

## 3. Build and test the app

```bash
# Compile check, no signing, any simulator (fast; good for CI and pre-merge gates)
xcodebuild build -project App.xcodeproj -scheme App \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath .build/DerivedData CODE_SIGNING_ALLOWED=NO -quiet

# Tests on a specific simulator, keeping the result bundle
xcodebuild test -project App.xcodeproj -scheme App \
  -destination "platform=iOS Simulator,id=$UDID" \
  -derivedDataPath .build/DerivedData \
  -resultBundlePath .build/Results/test.xcresult

# One test, or one class
xcodebuild test ... -only-testing:AppTests/LoopTests/testCloseShowsMemoryPage
xcodebuild test ... -only-testing:AppTests/LoopTests -skip-testing:AppTests/LoopTests/testSlow

# Build once, test many times
xcodebuild build-for-testing ... && xcodebuild test-without-building ...
```

- The result bundle path must not already exist: delete it first or use a fresh name.
- Read results without Xcode: `xcrun xcresulttool get test-results summary --path test.xcresult`
  and `xcrun xcresulttool get test-results tests --path test.xcresult` (both print JSON).
- `-quiet` hides the build log. Without it, pipe through `tail -50`, or grep for `error:`, since
  full logs flood the context.
- Long builds: run them in the background and wait for the exit, rather than polling.
- Projects with `.metal` files on Xcode 26+ need the Metal toolchain once:
  `xcodebuild -downloadComponent MetalToolchain`.

## 4. Parallel sessions on one Mac

- **One DerivedData per session or worktree** (`-derivedDataPath .build/DerivedData` inside the
  worktree). A shared DerivedData means two sessions corrupt each other's build.
- **One simulator per session** (§5). Another session installing onto "the booted simulator"
  replaces your app mid-run.
- Never `simctl erase` or `shutdown all` a simulator you did not create.

## 5. Simulators the agent owns

```bash
# Newest iOS runtime. Pick it deliberately; "any iPhone" can land on an old runtime.
RUNTIME=$(xcrun simctl list runtimes --json | jq -r '[.runtimes[]
  | select(.isAvailable and (.identifier|startswith("com.apple.CoreSimulator.SimRuntime.iOS-")))]
  | sort_by(.version|split(".")|map(tonumber)) | last | .identifier')

# Device type: list them and pick by name (the iPhone Duo type ships with Xcode 27.1)
xcrun simctl list devicetypes | grep -i -E 'duo|iphone 17'
TYPE=$(xcrun simctl list devicetypes --json | jq -r '.devicetypes[] | select(.name|test("Duo")) | .identifier' | head -1)   # ⚠︎

# Create (or reuse) a simulator named for this session
NAME="GM-$SESSION"
UDID=$(xcrun simctl list devices --json | jq -r --arg n "$NAME" '[.devices[][]|select(.name==$n)]|first|.udid // empty')
UDID=${UDID:-$(xcrun simctl create "$NAME" "$TYPE" "$RUNTIME")}
xcrun simctl boot "$UDID" 2>/dev/null; xcrun simctl bootstatus "$UDID" -b
open -a Simulator --args -CurrentDeviceUDID "$UDID"     # only if a person wants to watch
```

| Task | Command |
|---|---|
| Install and launch | `xcrun simctl install "$UDID" .build/DerivedData/Build/Products/Debug-iphonesimulator/App.app` then `xcrun simctl launch "$UDID" com.example.app` |
| Launch with arguments | `xcrun simctl launch "$UDID" com.example.app -SmokeTest YES` (arguments after the bundle id) |
| Launch and capture stdout | `xcrun simctl launch --console-pty "$UDID" com.example.app` |
| Terminate / uninstall | `xcrun simctl terminate "$UDID" com.example.app` · `xcrun simctl uninstall "$UDID" com.example.app` |
| Screenshot | `xcrun simctl io "$UDID" screenshot out.png` |
| Video | `xcrun simctl io "$UDID" recordVideo --codec h264 out.mov` (stop with Ctrl-C / SIGINT) |
| Clean status bar (store screenshots) | `xcrun simctl status_bar "$UDID" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4` |
| Appearance, text size | `xcrun simctl ui "$UDID" appearance dark` · `xcrun simctl ui "$UDID" content_size extra-extra-large` |
| Logs | `xcrun simctl spawn "$UDID" log stream --style compact --predicate 'process == "App"'` |
| App's data folder | `xcrun simctl get_app_container "$UDID" com.example.app data` |
| Open a URL | `xcrun simctl openurl "$UDID" "myapp://level/P1"` |
| First-run reset (own simulator only) | `xcrun simctl erase "$UDID"` |
| Clean up at the end | `xcrun simctl delete "$UDID"` |

- **Signed vs unsigned:** a simulator build you will *run* should be signed ("Sign to Run Locally"
  needs no identity). `CODE_SIGNING_ALLOWED=NO` builds launch, but have no keychain access, so
  anything stored in the keychain silently fails. Use unsigned builds for compile gates only.

### The iPhone Duo simulator

- Device Hub (Xcode 27.1) has on-screen **open, close, rotate and fold** controls for the Duo
  simulator. Check `xcrun simctl help` for a command-line equivalent ⚠︎; none is documented in the
  `iphone-duo` sources.
- **So that agents can test every pose without the GUI**, give the app a DEBUG-only launch argument
  that forces its fold state (for example `-FoldOverride closed|open|angle:0.4`), read in the same
  place the real hinge provider is chosen. Screenshots of each pose then come from `simctl` alone.
- Pose and resizing tests otherwise follow
  [`iphone-duo-testing-launch`](../iphone-duo-testing-launch/SKILL.md).

## 6. Physical devices (`devicectl`)

```bash
xcrun devicectl list devices
xcrun devicectl device install app --device "$DEVICE_ID" .build/DerivedData/Build/Products/Debug-iphoneos/App.app
xcrun devicectl device process launch --device "$DEVICE_ID" com.example.app
xcrun devicectl device info apps --device "$DEVICE_ID" | grep com.example.app
```

Device builds must be signed for that device (§7). A person has to pair the device, enable
Developer Mode and trust the Mac once.

## 7. Signing for local and CI builds

Automatic signing, authorised by an App Store Connect API key, so no Apple ID has to be signed in to
Xcode:

```bash
xcodebuild build -project App.xcodeproj -scheme App -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$HOME/.appstoreconnect/private_keys/AuthKey_$ASC_KEY_ID.p8" \
  -authenticationKeyID "$ASC_KEY_ID" -authenticationKeyIssuerID "$ASC_ISSUER_ID"
```

- The key needs the App Manager or Admin role to create profiles. `.p8`, `.p12`, `.cer` and
  `.mobileprovision` files are git-ignored, always.
- Certificates, profiles, bundle ids and capabilities through the API: `appstore` plugin →
  `asc-signing-setup`. Archive, export and upload: `asc-xcode-build`.

## 8. The in-app smoke harness

The cheapest end-to-end gate that needs no UI-test target:

1. A DEBUG-only launch argument (`-SmokeTest YES`) makes the app drive itself: load content, play a
   scripted path (for example, apply a level's solution through the same API the UI uses), then
   write `Documents/smoke.json` with named results (`{"launched":true,"levelsLoaded":100,"p1Solved":true}`).
2. A script launches it in the agent's own simulator, polls for the file through
   `get_app_container … data` (with a timeout), checks each field with `jq -e`, and saves a
   screenshot and the last two minutes of logs as evidence.
3. Compile the harness out of Release (`#if DEBUG`).

## Done when

- [ ] Packages test with `swift test`; the app builds with one `xcodebuild` line; a single test can
      be run by name.
- [ ] Every session uses its own DerivedData and its own named simulator, and deletes the simulator
      when finished.
- [ ] Signing works with the API key alone, and no secret is in the repo.
- [ ] The smoke harness runs in CI and leaves a screenshot, logs and its JSON.
