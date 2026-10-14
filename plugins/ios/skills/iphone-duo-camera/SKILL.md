---
name: iphone-duo-camera
description: >
  Camera capture with AVFoundation/AVKit on iPhone Duo, which has two front cameras (outer ultra wide,
  inner under-display ultra wide) and displays facing opposite ways. Covers the Virtual Front Camera,
  builtInOuterUltraWideCamera / builtInInnerUltraWideCamera and their limits, AVCaptureDeviceDirectionCoordinator
  with sendable AVCaptureDeviceDescriptors, mirroring by direction instead of position, the rotation
  coordinator, preview videoGravity and dynamicAspectRatio, and a CameraCaptureAccessory (e.g. a
  teleprompter) on the outer display. Use when building or fixing a camera, video-call, scanning or
  selfie feature for iPhone Duo.
---

# iPhone Duo — camera

## Overview

iPhone Duo is the first iPhone with **two front cameras**. Both have square sensors with an
ultra-wide field of view. Its displays face opposite ways, so **which way a camera points depends
on which display the app is on**. Opening, closing or turning the device can make the "front"
camera face away from the user, or make a **rear** camera face them (a rear-camera selfie). The
`position` property still says where a camera is mounted (`.front` / `.back`), but **not which way
it faces**.

| Camera | Device type | Max video | Depth |
|---|---|---|---|
| Outer front | `.builtInOuterUltraWideCamera` | 4K @ 120 fps | yes |
| Inner front (under-display, hidden until in use) | `.builtInInnerUltraWideCamera` | 1080p @ 60 fps | yes |
| Virtual front camera | found with `.builtInWideAngleCamera` / `.builtInUltraWideCamera` + `.front` | only what both share: 1080p @ 60 fps | **no** |
| Rear | existing types (e.g. `.builtInDualWideCamera`) | as on other iPhones | as before |

## Instructions

### 1. Choose a strategy

- **Default: the virtual front camera.** Existing front-camera discovery returns it on Duo. It's a
  virtual device (`isVirtualDevice == true`) that follows the app between displays.
  `activePrimaryConstituent` tells you which physical camera is streaming (it's `nil` until the
  session runs). Existing apps work **without changes**.
- **When capture is the app's main purpose: physical cameras + a direction coordinator.** This
  gives you full capabilities (4K/120 on the outer camera, depth). Switching cameras becomes the
  app's job.

```swift
let session = AVCaptureDevice.DiscoverySession(
    deviceTypes: [.builtInWideAngleCamera, .builtInUltraWideCamera],
    mediaType: .video, position: .front)          // → virtual front camera on iPhone Duo
let front = session.devices.first
let streaming = front.flatMap { $0.isVirtualDevice ? $0.activePrimaryConstituent : $0 }
```

### 2. Track direction with `AVCaptureDeviceDirectionCoordinator` (AVKit, iOS 27.1)

- Create it on the **main actor** with the **preview view** (only as a frame of reference), the
  device types you capture from, **including the rear cameras**, and a change handler. Don't list the
  virtual front camera. List the two physical front cameras in its place. External, Continuity
  Camera and Desk View devices are ignored.
- Keep a **strong reference** while the view is on screen. The handler runs on the main actor soon
  after creation (with the starting state) and again on every change. Until then,
  `deviceDirections` is empty.
- It reports an `AVCaptureDeviceDirectionMap` with `forwardFacingDeviceDescriptors` (cameras facing
  the same way as the view, toward the person looking at it) and `backwardFacingDeviceDescriptors`.
- **One coordinator per preview view.** If the app shows previews on both displays, each
  coordinator reports directions relative to its own view, so the same rear camera can be forward
  for one and backward for the other.
- **Don't call AVFoundation in the handler.** Pass the `Sendable` `AVCaptureDeviceDescriptor`
  (`deviceType`, `mediaTypes`, `position`, `uniqueID`, `localizedName`) to the actor that owns
  the session, and resolve it there.

```swift
@MainActor
final class DirectionObserver {
    private let captureService: CaptureService      // actor owning AVCaptureSession
    private var coordinator: AVCaptureDeviceDirectionCoordinator?
    private var active: AVCaptureDeviceDescriptor?

    init(captureService: CaptureService) { self.captureService = captureService }

    func start(previewView: UIView) {
        coordinator = AVCaptureDeviceDirectionCoordinator(
            view: previewView,
            deviceTypes: [.builtInOuterUltraWideCamera, .builtInInnerUltraWideCamera, .builtInDualWideCamera]
        ) { [weak self] map in self?.directionsChanged(map) }
    }

    private func directionsChanged(_ map: AVCaptureDeviceDirectionMap) {
        let forward = map.forwardFacingDeviceDescriptors
        if let active, forward.contains(active) { return }      // still facing the user
        guard let next = forward.first else { return }          // nothing faces forward now
        active = next
        maskPreview()                                           // hide frames from the outgoing camera
        Task { try await captureService.selectCamera(with: next) }
    }
}

actor CaptureService {
    private let session = AVCaptureSession()
    private var input: AVCaptureDeviceInput?

    func selectCamera(with descriptor: AVCaptureDeviceDescriptor) throws {
        guard let device = AVCaptureDevice(uniqueID: descriptor.uniqueID) else { return } // set changed; don't force-unwrap
        let newInput = try AVCaptureDeviceInput(device: device)
        session.beginConfiguration(); defer { session.commitConfiguration() }
        if let input { session.removeInput(input) }
        guard session.canAddInput(newInput) else { if let input { session.addInput(input) }; return }
        session.addInput(newInput); input = newInput
    }
}
```

- Swap **one** video input instead of running a multi-camera session. It's cheaper and covers most apps.
- **Mask the preview** while switching, and show it again once the new camera delivers frames.
- The same code runs on every iPhone. On single-display phones the coordinator reports fixed
  directions once (front = forward, back = backward). **Never infer direction from type or position.**

### 3. Mirror by direction, not position

The connection mirrors automatically for `position == .front`. That's wrong when a rear camera
faces the user (it should be mirrored) or a front camera faces away (it shouldn't be). Override only
when position and direction disagree, and set `automaticallyAdjustsVideoMirroring = false`
**before** assigning `isVideoMirrored`. Otherwise it throws an exception:

```swift
func applyMirroring(_ map: AVCaptureDeviceDirectionMap, device: AVCaptureDevice, connection: AVCaptureConnection) {
    guard connection.isVideoMirroringSupported else { return }
    let forward  = map.forwardFacingDeviceDescriptors.contains  { $0.uniqueID == device.uniqueID }
    let backward = map.backwardFacingDeviceDescriptors.contains { $0.uniqueID == device.uniqueID }
    let isFront = device.position == .front
    guard (forward && !isFront) || (backward && isFront) else { return }
    connection.automaticallyAdjustsVideoMirroring = false
    connection.isVideoMirrored = forward
}
```

Call it on every new map **and** after reconnecting an input. A new input creates a new preview
connection that doesn't keep the override.

### 4. Polish the preview

- **Rotation:** use `AVCaptureDevice.RotationCoordinator` for both preview and capture angles. On
  Duo it also updates when the app **moves between displays**. Create a **new one per camera**.
  Once it's in place, set `AVCapturePhotoOutput.isCameraSensorOrientationCompensationEnabled = false`
  for better performance. Compensation is on for all of Duo's front cameras.
- **Rear camera on the inner display:** the full field of view leaves space around the preview.
  Either offset the preview and group the controls in the leftover space, or fill the display. Set
  the choice with `AVCaptureVideoPreviewLayer.videoGravity`.
- **Front ultra-wide cameras:** the square sensor can fill the inner display. Pick a landscape
  `AVCaptureDevice.dynamicAspectRatio`.
- Keep viewfinder-critical UI clear of the **inner camera's occlusion region** when it's active
  ([`iphone-duo-fold-layouts`](../iphone-duo-fold-layouts/SKILL.md#4-use-reserved-regions-for-custom-views)).

### 5. Show UI on the outer display (camera capture accessory)

When the device is open, the app is full screen on the inner display, and a capture session is
running, the app can show interactive content on the **outer display**, which faces the subject. Use
it for a teleprompter, a countdown, a framing guide, or something fun to make a child look at the
camera.

```swift
struct CameraView: View {
    @State private var script = ScriptModel()
    @State private var isScriptEnabled = true
    @State private var showsScriptControls = false

    var body: some View {
        CameraPreview()
            .sceneAccessory {
                CameraCaptureAccessory(isEnabled: $isScriptEnabled) {
                    ScriptView(model: script)               // shares the same observable model
                }
                .onAvailabilityChange { showsScriptControls = $0 }
            }
    }
}
```

```swift
// UIKit
final class CameraViewController: UIViewController {
    private let script = ScriptModel()                      // keep a strong reference
    private var registration: UISceneAccessoryRegistration?

    override func viewDidLoad() {
        super.viewDidLoad()
        let config = UISceneConfiguration()
        config.delegateClass = ScriptSceneDelegate.self
        registration = registerSceneAccessory(.cameraCapture(sceneConfiguration: config, userInfo: script))
    }
    override func updateProperties() {                      // availability is observable
        super.updateProperties()
        scriptControls.isHidden = !(registration?.isAvailable ?? false)
    }
}
// ScriptSceneDelegate: read connectionOptions.sceneAccessoryUserInfo as? ScriptModel in willConnectTo.
// Identify this scene by session.role == .windowCameraCaptureAccessory. No Info.plist manifest entry: it has no effect.
```

- Register on the **capture view controller or view**. A deeper view that registers its own
  accessory takes over, and going back restores yours.
- Availability ends when capture stops, the app goes to the background, or the device closes.
- **Turning it off:** bind `isEnabled` / set `registration.isEnabled` from a user control. Call
  `unregisterSceneAccessory(_:)` only when the app stops offering it altogether.
- Keep interaction **minimal**. Every essential control stays in the main capture UI. Keep state in
  the model, not in the accessory's views.
- Accessories of different kinds don't compete. Slides on an external display and a teleprompter
  on the outer display can run together.

### 6. Test

The Simulator has no camera. Check accessory layout in previews or the Simulator, but test capture,
direction changes, mirroring and the accessory **on a device**: open, close, flip open, and in
Split View.

## Done when

- [ ] A strategy is chosen: virtual front camera, or physical cameras + coordinator.
- [ ] The coordinator includes the rear cameras, runs on the main actor, and passes descriptors to the capture actor.
- [ ] Mirroring is correct for a rear-camera selfie and for a front camera facing away.
- [ ] A rotation coordinator is recreated per camera, and sensor compensation is off.
- [ ] Preview gravity and aspect ratio are chosen for the inner display.
- [ ] The outer-display accessory (if any) is optional, user-toggleable and follows availability.

## API reference

Apple reference links for every API above (full declarations, enum cases, availability):
[`iphone-duo/references/api-reference.md`](../iphone-duo/references/api-reference.md#camera).
Pair with [`references/sources.md`](../iphone-duo/references/sources.md) for the articles and tech talks.
