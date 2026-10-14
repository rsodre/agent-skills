---
name: iphone-duo-resizability
description: >
  Making an iOS app (SwiftUI or UIKit) resize correctly on iPhone Duo, iPhone Mirroring and iPad.
  Covers removing UIScreen.main, orientation-based and idiom-based layout, hard-coded device sizes;
  the required UIScene lifecycle; size classes; re-reading size on change; asymmetric safe areas and
  layout margins; concentric corners; full-bleed media; UIRequiresFullScreen and games. Ships
  scripts/audit-resizability.sh, which greps a Swift project for every known anti-pattern. Use when
  auditing or fixing an app for iPhone Duo or resizing, or when layout breaks after folding/unfolding.
---

# iPhone Duo — resizability

Device facts (size-class matrix, SDK tiers) are in [`iphone-duo`](../iphone-duo/SKILL.md). This
skill covers the code changes that let an app survive being resized at any moment.

## Overview

On iPhone Duo the app's size changes **mid-session** whenever the device folds, unfolds or enters
Split View, and it often doesn't match the screen's size. Hard-coded screen sizes, fixed
orientations and device assumptions lead to stretched, clipped or misplaced content. The fix is the
same as for any adaptive app: **size everything from the container you're in, and re-read the size
every time it changes.**

## Instructions

### 1. Run the audit first

```bash
bash <skill-dir>/scripts/audit-resizability.sh path/to/YourApp     # prints file:line hits by category
```

Then, if Xcode 27.1 is available, also run Xcode's **App Resizability** skill (ask Xcode's
assistant to "get my app ready for iPhone Duo"; `xcrun agent skills export` exports it as markdown
for other agents). Neither tool finds every problem. Work through each section below even when the
audit comes back clean.

### 2. Adopt the scene lifecycle

With the iOS 27 SDK, **an app without `UIScene` lifecycle doesn't launch.** Check for a
`UIApplicationSceneManifest` in Info.plist and a `UIWindowSceneDelegate` (UIKit), or a SwiftUI `App`.

```swift
// Before
window = UIWindow(frame: UIScreen.main.bounds)
// After — in scene(_:willConnectTo:options:)
guard let windowScene = scene as? UIWindowScene else { return }
let window = UIWindow(windowScene: windowScene)
```

Save UI state per scene (`stateRestorationActivity(for:)` /
`scene(_:restoreInteractionStateWith:)`), because each window of the app is a separate scene and
iPhone Duo can show more than one (see [`iphone-duo-hinge-scenes`](../iphone-duo-hinge-scenes/SKILL.md)).

### 3. Stop sizing from the main screen

`UIScreen.main` is ambiguous on a device with two displays and will be deprecated. Replace every use:

| Before | After (UIKit) | After (SwiftUI) |
|---|---|---|
| `UIScreen.main.bounds` (layout) | `view.bounds`, `superview.bounds`, `window.bounds` | `GeometryReader`, `.onGeometryChange(for:of:action:)` |
| `UIScreen.main.bounds` (scene-level space) | `windowScene.effectiveGeometry.coordinateSpace.bounds` | — |
| `UIScreen.main.scale` / `nativeScale` | `traitCollection.displayScale` | `@Environment(\.displayScale)` |
| A stored `UIScreen` property | `view.window?.windowScene?.screen`, looked up when needed, or passed in as a parameter | — |
| `UIWindow(frame: UIScreen.main.bounds)` | `UIWindow(windowScene:)` | — |

The best fix removes screen references entirely and uses the environment, the trait collection or
the view's bounds instead. When a helper really needs a screen, pass it in:
`func thumbnail(for image: UIImage, screen: UIScreen)`.

### 4. Re-read the size whenever it changes

Reading the size once at launch or in `viewIsAppearing` isn't enough. A fold can resize the app
in the middle of a session.

- Do size-dependent layout in `layoutSubviews` / `viewDidLayoutSubviews`.
- Use `viewWillTransition(to:with:)` for work that has to run when the size changes.
- Scene-wide: implement `windowScene(_:didUpdateEffectiveGeometry:)` in the scene delegate.
- **Automatic trait tracking:** traits read inside `layoutSubviews`, `updateProperties`,
  `draw(_:)` and similar methods are tracked, and the method is called again when they change. In
  other places, call `registerForTraitChanges([UITraitDisplayScale.self]) { (view: MyView, _) in view.cache.invalidate() }`.
- Expensive re-renders (games, large assets): skip work while
  `effectiveGeometry.isInteractivelyResizing` is true and rebuild when the resize finishes.

```swift
override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    let available = view.bounds.size              // not the screen, not the scene
    let isWide = available.width > available.height
    collectionLayout.columnCount = columns(for: available, isWide: isWide)
}
```

### 5. Choose layouts by size class or available space, never by idiom or orientation

- **Idiom:** an iPhone app on iPhone Duo, iPad or in iPhone Mirroring is still `.phone`, yet it
  can have **any combination of size classes**. Remove `userInterfaceIdiom == .phone / .pad`
  layout branches.
- **"Regular width" no longer means iPad.** Code that switches to an "iPad layout" when
  `horizontalSizeClass == .regular`, or assumes iPhone is always compact, now runs on an iPhone.
  Make sure the regular layout works *as an iPhone app*. On the inner display it should look like a
  natural extension of the app's iPad layout.
- **Orientation:** remove layout logic based on `UIDevice.current.orientation`,
  `statusBarOrientation`, `interfaceOrientation` or `windowScene.effectiveGeometry.interfaceOrientation`.
  The inner display ignores supported orientations, and iPhone Mirroring always reports portrait.
  "A rotation is only an animated bounds change." To ask whether the app is wide, compare
  `bounds.width > bounds.height`.
- **Device sizes:** remove comparisons like `bounds.height == 844` and any list of known iPhone sizes.
- **Motion and heading:** instead of rotating sensor data by interface orientation, attach it to
  the view: `motionManager.deviceMotionBody = view`, `locationManager.headingBody = view`.

```swift
// SwiftUI
@Environment(\.horizontalSizeClass) private var horizontalSizeClass
@Environment(\.verticalSizeClass) private var verticalSizeClass
// UIKit
traitCollection.horizontalSizeClass
traitCollection.verticalSizeClass
```

### 6. Respect safe areas, and treat them as asymmetric

Bars on iPhone Duo sit **outside** the safe area. Horizontal bars add top and bottom insets.
Vertical bars add a **leading or trailing** inset, and that inset can be on the left (landscape,
Split View on the left half). Insets on opposite sides are rarely equal.

- **Foreground** (controls, text, anything interactive) goes inside the safe area. SwiftUI does this by default.
  In UIKit, constrain to `safeAreaLayoutGuide` / `layoutMarginsGuide`, or inset by `safeAreaInsets`.
- **Background** (full-bleed art) can fill the bounds: `.ignoresSafeArea()` / `backgroundView.frame = view.bounds`.
  To run hero art under a vertical bar or sidebar, use `.backgroundExtensionEffect()` /
  `UIBackgroundExtensionView`.
- **Layout margins are asymmetric too.** Content can sit closer to the vertical bar and the status bar
  while keeping the normal margin on the other side. Use the margins guide rather than fixed padding.
- For bar-like custom content near corners or window controls, use
  `layoutGuide(for: .margins(cornerAdaptation: .horizontal))`.

```swift
// Wrong — assumes equal insets
let width = view.bounds.width - view.safeAreaInsets.left * 2
// Right — each side separately
let width = view.bounds.inset(by: view.safeAreaInsets).width
foreground.frame = view.bounds.inset(by: view.safeAreaInsets)
```

For custom bars or edge-to-edge UI that needs to get *past* the safe area without colliding with
system UI, use reserved regions. See [`iphone-duo-fold-layouts`](../iphone-duo-fold-layouts/SKILL.md).

### 7. Match the display's corners

To fit the screen corners exactly, use the concentricity APIs (iOS 26, updated for Duo's shapes):

```swift
ConcentricRectangle()        // SwiftUI
    .fill(.green)
    .padding(8)
    .ignoresSafeArea()
// UIKit: UICornerConfiguration on the view
```

### 8. Check full-bleed media

Hero images and video set to `.scaleAspectFill` / `.aspectRatio(contentMode: .fill)` can crop
important content on the wider displays. Choose between fill and fit from the current size class
or aspect ratio, or set a focal point, so the subject survives every shape.

### 9. Prefer system containers

`NavigationSplitView` / `UISplitViewController`, `TabView` / `UITabBarController` and
`NavigationStack` / `UINavigationController` handle resizing, the outer display, the fold, camera
occlusion and vertical bars on their own. Size views relative to their container, and use Auto
Layout in UIKit. Columns: `minimumPrimaryColumnWidth` / `maximumPrimaryColumnWidth` /
`preferredSupplementaryColumnWidth`. Don't require widths that stop columns from appearing. Use the
`splitViewControllerLayoutEnvironment` trait to adapt cells when the split view is collapsed.
Use `UISceneSizeRestrictions.minimumSize` only when the app has a real minimum, because it reduces
flexibility.

### 10. Orientation locks, `UIRequiresFullScreen` and games

- `UIRequiresFullScreen` is honoured on iPhone in resizable environments starting with iOS 27. It no
  longer opts out of resizing. It turns on **discrete resizing**: the scene jumps to a new
  configuration at each size and respects supported orientations, so a game always renders at full
  quality. The app still resizes when iPhone Duo opens or closes. Adaptive apps should remove the key.
- To lock orientation temporarily (for example, steering by tilting), override
  `prefersInterfaceOrientationLocked`, call `setNeedsUpdateOfPrefersInterfaceOrientationLocked()`,
  and watch `effectiveGeometry.isInterfaceOrientationLocked` in `didUpdateEffectiveGeometry`.
- Game design guidance (fill the screen in every pose, change the aspect ratio rather than
  letterboxing) is in [`iphone-duo-design`](../iphone-duo-design/SKILL.md).

## Done when

- [ ] The audit script shows no unexplained hits in the *screen*, *orientation*, *idiom* and *device-size* groups.
- [ ] Scene lifecycle adopted. Windows are created from scenes.
- [ ] All size-dependent work re-runs on resize, with no values cached from launch.
- [ ] Layout branches read size classes or the container's size only.
- [ ] Safe-area code handles each edge on its own, and the app works with the vertical bar on **either** side.
- [ ] Full-bleed media keeps its subject on the outer display, the inner display and in Split View.
- [ ] Tested by resizing to extremes. See [`iphone-duo-testing-launch`](../iphone-duo-testing-launch/SKILL.md).

## API reference

Apple reference links for every API above (full declarations, enum cases, availability):
[`iphone-duo/references/api-reference.md`](../iphone-duo/references/api-reference.md#resizability--screens-traits-geometry-safe-areas).
Pair with [`references/sources.md`](../iphone-duo/references/sources.md) for the articles and tech talks.
