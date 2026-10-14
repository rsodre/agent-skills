# Sources

The `iphone-duo-*` skills condense these Apple sources, read in October 2026 against iOS 27.1 /
Xcode 27.1. When a claim needs checking or an API has changed, start with the source below.

## Pages

| Source | Covers |
|---|---|
| [Prepare — iPhone Duo](https://developer.apple.com/iphone-duo/prepare/) | What each SDK gets you (26 / 27 / 27.1), the three steps (resizability skill → fix patterns → test), the pattern list (`UIScreen.main`, orientation, idiom, device sizes, full-bleed media), test tools, and App Store screenshots, badge and featuring nomination |
| [Preparing your app for iPhone Duo](https://developer.apple.com/documentation/technologyoverviews/preparing-your-app-for-iphone-duo) | Developer overview: layout checks, vertical bars and their exceptions (inspectors, split views, sheets), item organisation APIs, arrangement views, reserved regions, camera |
| [Designing for iPhone Duo (HIG)](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo) | Anatomy, poses, best practices, dynamic layouts, reserved regions, split views, arrangement views, vertical controls (ordering, priority, compression, overflow, full-width layouts) |
| [Choosing a camera by the direction it faces](https://developer.apple.com/documentation/avkit/choosing-a-camera-by-the-direction-it-faces) | Virtual front camera, `AVCaptureDeviceDirectionCoordinator`, descriptors, mirroring, rotation |
| [Registering a camera capture accessory on iPhone Duo](https://developer.apple.com/documentation/avfoundation/registering-a-camera-capture-accessory-on-iphone-duo) | `CameraCaptureAccessory` / `UISceneAccessory.cameraCapture`, availability, enablement, testing |
| [TN3210: Optimizing your app for iPhone Mirroring](https://developer.apple.com/documentation/technotes/tn3210-optimizing-your-app-for-iphone-mirroring) | Indirect input, sheet dismissal, game pointer input, biometric companion auth, drag and drop |
| [Device Hub](https://developer.apple.com/documentation/xcode/device-hub) | Xcode 27's simulator and device manager |

## Tech talks and sessions (transcripts read in full)

| Video | Covers |
|---|---|
| [Prepare your app for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111461) | Getting started, size class matrix, main screen, concentricity, `UIRequiresFullScreen`, sidebars, sheets, safe areas and asymmetric insets, reserved regions, the App Resizability skill |
| [Design for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111466) | Design principles, controls on the side, fold behaviour, 50/50 split, PiP pinning, the tabletop layout, centring vs offset, inner-display strategies, sheet behaviour |
| [Raise the bar with iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111462) | Vertical bars in depth: opt-in, containers, ordering, icon/title representation, `axisBehavior`, badges, custom views, spacers, compression, overflow, priority, disabling |
| [Strike a pose with adaptive layouts on iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111463) | Displacement patterns, region purposes per pose, reserved regions API, arrangements (split vs overlay, axes, z-index), choosing an arrangement |
| [Leverage multiple displays and scenes on iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111464) | Hinge API, multitasking, multiple windows (none from the outer display), scene accessories, the teleprompter example |
| [Build a great camera experience for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111465) | Front cameras' specs, virtual front camera, direction coordinator, preview gravity, dynamic aspect ratio, rotation coordinator |
| [Modernize your UIKit app (WWDC26)](https://developer.apple.com/videos/play/wwdc2026/278) | Required scene lifecycle, main-screen removal, `displayScale`, trait tracking, effective geometry, idiom and orientation, discrete resizing, Body protocols, iPhone sidebars, prominent tab, bar minimisation, the modernisation skill |
| [Make your UIKit app more flexible (WWDC25)](https://developer.apple.com/videos/play/wwdc2025/282) | Scenes and state restoration, split view controller columns and inspector, tab groups, size restrictions, layout margins, corner-adapted guides, orientation lock, `isInteractivelyResizing` |

## Known gaps

- The SwiftUI `onHingeChange` reference page wasn't published when this was written. Its shape
  (`{ previous, current in }`, `current.hinge?.status`, `hinge.angle` as `Angle`) comes from the
  tech talk's code. The UIKit side (`UIHingeInteraction`, `UIHinge.Status`, angle in radians) comes
  from the reference docs.
- On whether `reservedRegions` returns inactive regions by default, the SwiftUI reference text
  (which says "regardless of whether they are currently active") and the tech talk ("by default,
  only active ones") disagree. Always check `isActive`, and pass `.includeInactive` when you want
  the inactive ones.
