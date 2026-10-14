---
name: iphone-duo-hinge-scenes
description: >
  Using what's unique to iPhone Duo beyond layout: the hinge API (SwiftUI onHingeChange, UIKit
  UIHingeInteraction / UIHinge — status closed/partiallyOpen/fullyOpen plus a live angle), Split View
  multitasking and the pinned Picture-in-Picture layout, multiple windows (only from the inner display;
  handle scene-request errors, UIWindowScene.ActivationAction), and scene accessories that show UI on
  another display. Use when building hinge-driven interactions or effects, supporting multiple
  windows/scenes, or showing content on the outer display.
---

# iPhone Duo — hinge, multitasking and scenes

Camera-specific scene accessories are covered in more depth in
[`iphone-duo-camera`](../iphone-duo-camera/SKILL.md).

## Instructions

### 1. Hinge: for interactions and effects, not layout

The hinge gives a **discrete status** and a **continuous angle**, updated live. Good uses: a
wallpaper-style zoom as the device opens, a whammy-bar pitch bend, opening a lid, parallax, game
input. **Layout must not depend on the angle.** Use reserved regions and arrangements instead
([`iphone-duo-fold-layouts`](../iphone-duo-fold-layouts/SKILL.md)).

Status values: `closed`, `partiallyOpen`, `fullyOpen` (UIKit also has `unknown`). The UIKit
angle is in **radians**. SwiftUI gives an `Angle`.

```swift
struct InstrumentView: View {
    @State private var pitchBend: Double = 0          // 0 = none, 1 = deepest

    var body: some View {
        GuitarView(pitchBend: pitchBend)
            .onHingeChange { _, context in            // (previous, current)
                // nil hinge = this device has no hinge
                if let hinge = context.hinge, hinge.status == .partiallyOpen {
                    pitchBend = calculatePitchBend(angle: hinge.angle)
                } else {
                    pitchBend = 0                       // always reset outside the state you read
                }
            }
    }
}
```

```swift
// UIKit
let interaction = UIHingeInteraction { [weak self] _, update in
    guard let self else { return }
    guard let hinge = update.hinge else {           // left a hierarchy that provides hinge updates
        self.handleHingeUnavailable(); return
    }
    self.updateAngle(hinge.angle)                   // radians
    self.updateStatus(hinge.status)
}
view.addInteraction(interaction)                    // interaction.isEnabled to pause
```

Rules:
- Handle a `nil` hinge, because most devices don't have one. The feature must still work, or be
  absent, without it.
- Reset effect state when the device leaves the status you read.
- Keep the work in the handler light, since it runs continuously while the device moves.
- Hinge input is an extra. Never make it the **only** way to do something. Offer an on-screen
  control too (see [`iphone-duo-design`](../iphone-duo-design/SKILL.md) for accessibility).

### 2. Multitasking: just resizing, done well

- **Every app** takes part in Split View on the inner display. Drag an app to the side using the
  home indicator to get a **50/50** split. Each half works independently. Each app puts its
  vertical controls on its **outer** edge.
- **Pinned PiP:** a Picture-in-Picture video can be pinned to the top. The app below **resizes
  vertically** to fit. When partially folded, the video fills half the screen, so apps must adapt
  to changing heights in real time.
- Nothing here needs special handling. It's resizing. Follow
  [`iphone-duo-resizability`](../iphone-duo-resizability/SKILL.md) (size classes, scene geometry,
  asymmetric safe areas) and test both halves.

### 3. Multiple windows

iPhone Duo is the **first iPhone that supports more than one instance of an app's UI**. If the app
supports multiple scenes on iPad, it does so on Duo too, with one difference:

- **New windows can't be created from the outer display.** Only the inner display can. Whether
  windows are available changes as the device opens and closes.
- **Handle errors** from scene activation requests. Don't assume they succeed.
- Use **`UIWindowScene.ActivationAction`** (Objective-C: `UIWindowSceneActivationAction`) for "Open in New Window" actions. It hides itself when
  new windows aren't available.
- Keep state per scene (state restoration per scene, with no global "current window" assumptions).

### 4. Scene accessories: UI on another display

A scene accessory pairs extra content with the app's main UI, shown on another display. The
**system** decides when it's available. Accessories are on by default, but conditions can change
at any time.

| Accessory | Where | Interactive |
|---|---|---|
| `ExternalNonInteractiveAccessory` | external display (for example, an iPhone as a game controller with the game on a TV) | no |
| `CameraCaptureAccessory` | iPhone Duo's **outer** display while the app is full screen on the inner display with an active capture session | yes, lightly |

```swift
CameraView(model: model)
    .sceneAccessory {
        CameraCaptureAccessory(isEnabled: $model.isEnabled) {
            TeleprompterView(model: model)              // same observable model, no messaging
        }
        .onAvailabilityChange { model.isAvailable = $0 }
    }
    .toolbar { TeleprompterToggle(isEnabled: $model.isEnabled).disabled(!model.isAvailable) }
```

- Register the accessory on the **view it belongs to**. It shows only while that view is on screen.
- **Availability** (set by the system) and **enablement** (the app's or user's choice) are
  separate. Watch availability. Bind enablement to a user control.
- Accessory content is always an **extra**. The main UI must work fully without it.
- UIKit registration, scene roles and testing are in
  [`iphone-duo-camera`](../iphone-duo-camera/SKILL.md#5-show-ui-on-the-outer-display-camera-capture-accessory).

## Done when

- [ ] Hinge features handle `nil`, reset state and have a non-hinge alternative.
- [ ] The app works in both halves of Split View and with a pinned PiP above it.
- [ ] "New window" actions use `UIWindowScene.ActivationAction`, and scene requests handle failure.
- [ ] Scene accessories react to availability, and the app works when they're unavailable.

## API reference

Apple reference links for every API above (full declarations, enum cases, availability):
[`iphone-duo/references/api-reference.md`](../iphone-duo/references/api-reference.md#hinge-windows-and-scene-accessories).
Pair with [`references/sources.md`](../iphone-duo/references/sources.md) for the articles and tech talks.
