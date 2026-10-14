---
name: iphone-duo-testing-launch
description: >
  Setting up, testing and shipping an app for iPhone Duo. Covers the toolchain (Xcode 27.1, iOS 27.1
  SDK, the App Resizability skill and `xcrun agent skills export`), Device Hub (iPhone Duo simulator with
  open/close/rotate/fold controls, the resizable simulator, Split View testing), iPhone Mirroring on
  macOS 27 and its compatibility fixes (indirect input, sheet dismissal, game pointer input, biometric
  companion auth), a device test plan, and App Store launch (Duo screenshots → "optimized" badge,
  preview tool, featuring nomination). Use when setting up a project for Duo, testing poses, or
  preparing an App Store submission.
---

# iPhone Duo — setup, testing and launch

## Instructions

### 1. Set up

- Install **Xcode 27.1** and build with the **iOS 27.1 SDK**. That gives full screen and vertical bars.
  The iOS 27 SDK only gets most of the inner display. The iOS 26 SDK runs centred or offset. See
  [`iphone-duo`](../iphone-duo/SKILL.md#what-the-sdk-gets-you).
- Check that the **UIScene lifecycle** is in place, since the iOS 27 SDK requires it to launch
  ([`iphone-duo-resizability`](../iphone-duo-resizability/SKILL.md#2-adopt-the-scene-lifecycle)).
- If the deployment target is below 27.1, put Duo APIs behind `if #available(iOS 27.1, *)`.
- **Agent tooling:** Xcode 27.1's assistant has an **App Resizability** skill (formerly the app
  modernisation skill). It now covers SwiftUI and iPhone Duo. It changes main-screen calls to trait
  or scene checks, orientation checks to size classes, and app lifecycle to scene lifecycle. It asks
  questions for complex cases and leaves comments for remaining work. Run
  `xcrun agent skills export` to export Xcode's skills as markdown for other agents. Then run this
  library's `audit-resizability.sh` as a cross-check.

### 2. Test in Device Hub

Device Hub (Xcode 27) manages simulated and physical devices and opens a compact window showing the
app on a device screen.

- **iPhone Duo simulator (Xcode 27.1):** the best way to test the full native experience. Use the
  controls at the bottom to **open, close, rotate and fold** the device.
- **Resizable simulator / resize mode:** in Device Hub *and* Xcode Previews, click "enter resize
  mode" and drag the device edges to any size. This is the fastest loop for layout work.
- **Split View:** on the inner display, drag the app by the **home indicator** to one side. A drop
  area appears. Then try the **other** side. The vertical bar can be on either edge.
- After the simulator, test on a real iPhone Duo, iPad and iPhone Mirroring.

### 3. Test in iPhone Mirroring (macOS 27)

iPhone apps can be resized freely in iPhone Mirroring on the Mac, and they always report a
**portrait** interface orientation. Resize the window to **extremes in both directions**. Then check
these compatibility points:

| Issue | Fix |
|---|---|
| Pinch, rotate or scroll don't work with a trackpad or mouse | Use `UIPinchGestureRecognizer` / `UIRotationGestureRecognizer`, and `UIPanGestureRecognizer.allowedScrollTypesMask` (`.continuous` for trackpad, `.all` to include scroll wheels) next to custom recognizers |
| `UIApplicationSupportsIndirectInputEvents` is `NO`, or missing with a deployment target below iOS 17 | Remove the key or set it to `YES` |
| Custom sheets or popovers don't dismiss with a scroll | Switch to `UISheetPresentationController` / `.sheet`, or set `allowedScrollTypesMask` on your pan recogniser |
| Game pointer input doesn't work | Use the Game Controller framework, `GCMouse` |
| Face ID / Touch ID fails while mirroring | Use `.deviceOwnerAuthenticationWithBiometricsOrCompanion`, or `SecAccessControlCreateFlags` `.biometryAny` + `.companion` |
| Can't move data between Mac and iPhone | Support drag and drop |

### 4. Device test plan

Run the pose matrix in
[`iphone-duo-design/references/review-checklist.md`](../iphone-duo-design/references/review-checklist.md),
and also:

- [ ] Open/close **during** every main task (editing, playback, form entry, a capture session). No state is lost.
- [ ] Fold slowly through the whole range. Nothing jumps. Hinge features (if any) reset properly.
- [ ] Start the inner camera (FaceTime-style). The UI moves aside and the viewfinder isn't covered.
- [ ] Start a Live Activity. The vertical bar still fits, and overflow behaves well.
- [ ] Bring up the keyboard in outer landscape. Overflow priorities hold, and accessory bars stay on the keyboard.
- [ ] Multiple windows: "New Window" is hidden or fails cleanly on the outer display.
- [ ] Camera apps: direction, mirroring and rotation when closing, opening and flipping. The
      outer-display accessory appears and disappears with availability (device only).
- [ ] Accessibility pass: VoiceOver, largest Dynamic Type, Reduce Transparency, RTL locale.
- [ ] Run `audit-resizability.sh` again. It should report no new unexplained hits.

### 5. Launch on the App Store

- **Duo screenshots:** submit iPhone Duo screenshots in App Store Connect. They should show the app
  across orientations and poses. Doing so gives the product page a badge saying the app is
  **optimised for iPhone Duo**. Check the current screenshot specifications in App Store Connect
  Help before capturing.
- **Preview tool:** use App Store Connect's new preview tool to see how the assets (including new
  creative assets) look on iPhone Duo.
- **Featuring:** submit a featuring nomination in App Store Connect. In *Helpful Details*, say the
  app is optimised for iPhone Duo, including support for all device poses.
- Release notes: mention what's new on Duo (vertical controls, inner-display layouts, camera or
  hinge features), described as user benefits.
- Apple also runs iPhone Duo workshops (Meet with Apple) for hands-on help.

## Done when

- [ ] Built with the iOS 27.1 SDK. Scene lifecycle is in place. 27.1 APIs are gated.
- [ ] The full matrix has passed in the Duo simulator **and** on a device. iPhone Mirroring has been
      checked at extreme sizes.
- [ ] Duo screenshots uploaded and checked in the preview tool. Featuring nomination filed.

## API reference

Apple reference links for every API above (full declarations, enum cases, availability):
[`iphone-duo/references/api-reference.md`](../iphone-duo/references/api-reference.md#testing-and-iphone-mirroring).
Pair with [`references/sources.md`](../iphone-duo/references/sources.md) for the articles and tech talks.
