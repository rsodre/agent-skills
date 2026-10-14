---
name: iphone-duo
description: >
  Entry point for any work on an app for iPhone Duo, Apple's foldable two-display iPhone (iOS 27.1+).
  Holds the device facts every other iphone-duo-* skill relies on: anatomy, poses, size classes per
  display, where bars go in each pose, what each SDK (26 / 27 / 27.1) gets you, the readiness workflow,
  and a map that routes each task to the right skill. Use when someone says "iPhone Duo", "foldable
  iPhone", "fold", "hinge", "inner/outer display", "get my app ready for iPhone Duo", or asks how an
  iOS app should behave when the device opens, closes, folds or rotates.
---

# iPhone Duo

The canonical facts about the device and the order of work. Every other `iphone-duo-*` skill links
here instead of restating these facts.

## Overview

iPhone Duo is a foldable iPhone with a **compact outer display** and a **large inner display**. Each
display has its own front camera. A centre hinge lets people open, close, partially fold and stand
the device. As it moves, the app **resizes** and moves between displays. It is still an iPhone app:
`userInterfaceIdiom` stays `.phone`. What changes is size, shape, reserved regions and where the
bars go.

The main idea: **a great Duo app is a resizable app.** If the app already resizes well on iPad,
in iPhone Mirroring on macOS 27, or across size classes, most of the work is done. The Duo-specific
work is on top of that: vertical bars, the fold, the inner camera, the hinge, and the second display.

## Device facts

### Anatomy

| Part | Fact |
|---|---|
| Outer display | Wider and shorter than other iPhones. Used when the device is closed. The bars sit vertically on the right side. |
| Inner display | The largest iPhone display. Used when the device is open. Bars are horizontal in portrait and vertical in landscape. |
| Outer front camera | In the corner and always visible. Lines up with the vertical controls. **Always** an occlusion region. Expands into the Dynamic Island for Live Activities. |
| Inner front camera | Under the display. Hidden until it's in use. An occlusion region **only while active**. When it turns on, the UI moves aside. |
| Hinge / fold | A **division** region. Active only when the device is *partially* open. It splits the inner display into two usable regions. When the device is flat it's inactive and has zero width. |
| Rear cameras | When the device is open, they can face the person using it (rear-camera selfie). See [`iphone-duo-camera`](../iphone-duo-camera/SKILL.md). |

### Poses

Closed (outer display) · folded like a **tent** (standing on its edges) · open **wide** (landscape) ·
**partially folded** like a book · open **tall** (portrait) · folded like a **laptop** (on a table,
inner display facing the person, top half to look at, bottom half to touch).

You don't design one layout per pose. You design for **two size-class layouts** and let them flex.

### Size classes

| Context | Horizontal | Vertical |
|---|---|---|
| Outer display, portrait | compact | regular |
| Outer display, landscape | compact | compact |
| Inner display (any orientation) | **regular** | **regular** |
| Inner display, 50/50 Split View multitasking | depends on the space; read it, don't assume | |

- **Outer display:** interface orientation behaves like any iPhone and respects your supported
  orientations. Landscape is worth supporting because people stand the device up like a tent.
- **Inner display:** **ignores** your supported interface orientations. The app scales and
  resizes there, including in Split View. Never base layout on orientation.
- `UIRequiresFullScreen` is still honoured, but the app **still resizes** when the device opens or
  closes. It gets *discrete* resizing instead of being opted out.

### Where bars go

| Pose | Navigation bar / toolbar / tab bar |
|---|---|
| Outer display (portrait or landscape) | **Vertical**, on the side, under the status bar and Dynamic Island |
| Inner display, landscape | **Vertical** (kept the same as the outer display so the experience stays continuous) |
| Inner display, portrait | **Horizontal** (standard top and bottom bars; there's enough height) |
| Split View multitasking | Each app puts its vertical controls on its **outer** edge, so the left app has them on the left |

The bars stay fixed to the hardware. They stay on the same physical side in right-to-left
languages. Details are in [`iphone-duo-bars`](../iphone-duo-bars/SKILL.md).

### What the SDK gets you

| Built with | On iPhone Duo |
|---|---|
| iOS 26 SDK or earlier | Runs. Open: centred at a familiar iPhone size with empty space around it. Closed: drawn to the *left* of the status bar and camera. |
| iOS 27 SDK | Resizes to fill most of the inner display but stays out of the status bar strip on the right edge. |
| **iOS 27.1 SDK (Xcode 27.1)** | **Optimised.** Full display. Toolbars and tab bars go vertical under the status bar. |

> Before you ship a 27.1 build, check that your content adapts to the bars becoming vertical.
> That's the one behaviour change you get just by rebuilding.

Other SDK facts that affect Duo work:
- **The UIScene lifecycle is required** with the iOS 27 SDK. Without it, the app *doesn't launch*.
- `UIScreen.main` is ambiguous on a device with two displays and **will be deprecated**.

## Readiness workflow

Do the steps in this order. Each step points to the skill that owns it.

1. **Build with Xcode 27.1 / the iOS 27.1 SDK.** This turns on the full-screen experience and vertical bars.
2. **Run the resizability audit.** Use Xcode's built-in *App Resizability* skill (ask Xcode's
   assistant to "get my app ready for iPhone Duo"; export it for other agents with
   `xcrun agent skills export`), plus this library's grep audit →
   [`iphone-duo-resizability`](../iphone-duo-resizability/SKILL.md). Neither finds everything, so
   review the pattern list by hand too.
3. **Fix the resizing patterns.** Remove main-screen sizing, orientation checks, idiom checks and fixed
   sizes. Handle safe areas correctly → [`iphone-duo-resizability`](../iphone-duo-resizability/SKILL.md).
4. **Audit the bars.** Use system containers, put items in the right order, give every item an icon
   and a title, set overflow priorities → [`iphone-duo-bars`](../iphone-duo-bars/SKILL.md).
5. **Handle the fold.** Prefer system containers, use arrangement views, and use reserved regions
   for custom views → [`iphone-duo-fold-layouts`](../iphone-duo-fold-layouts/SKILL.md).
6. **Optional enhancements:** hinge-driven interactions, multiple windows, scene accessories →
   [`iphone-duo-hinge-scenes`](../iphone-duo-hinge-scenes/SKILL.md). Camera apps →
   [`iphone-duo-camera`](../iphone-duo-camera/SKILL.md).
7. **Design and accessibility review** in every pose →
   [`iphone-duo-design`](../iphone-duo-design/SKILL.md).
8. **Test** in Device Hub, iPhone Mirroring and the Duo simulator, then **ship** with Duo
   screenshots → [`iphone-duo-testing-launch`](../iphone-duo-testing-launch/SKILL.md).

## Skill map

| Task | Skill |
|---|---|
| `UIScreen.main`, orientation and idiom checks, size classes, safe areas, margins, scene lifecycle, full-bleed media, games and `UIRequiresFullScreen` | [`iphone-duo-resizability`](../iphone-duo-resizability/SKILL.md) |
| Toolbars, nav bars and tab bars going vertical, item order, `axisBehavior`, overflow, compression, sheets' bars | [`iphone-duo-bars`](../iphone-duo-bars/SKILL.md) |
| The fold, `ReservedRegion`, displacement, `ArrangementView`, split views, sidebar, grids, tabletop layout | [`iphone-duo-fold-layouts`](../iphone-duo-fold-layouts/SKILL.md) |
| Hinge angle and status, multiple windows, Split View multitasking, PiP, scene accessories | [`iphone-duo-hinge-scenes`](../iphone-duo-hinge-scenes/SKILL.md) |
| AVFoundation on Duo: virtual front camera, direction coordinator, mirroring, rotation, teleprompter on the outer display | [`iphone-duo-camera`](../iphone-duo-camera/SKILL.md) |
| Design principles, UX patterns, accessibility, games, design critique checklist | [`iphone-duo-design`](../iphone-duo-design/SKILL.md) |
| Device Hub, simulator controls, the test matrix, iPhone Mirroring compatibility, App Store screenshots and badge, featuring | [`iphone-duo-testing-launch`](../iphone-duo-testing-launch/SKILL.md) |

## API availability at a glance

| API | SwiftUI | UIKit | Since |
|---|---|---|---|
| Reserved regions | `GeometryProxy.reservedRegions(kind:options:layoutDirectionBehavior:)`, `ReservedRegion` | `UIView.reservedRegions(kind:options:)`, `UIView.ReservedRegion` | 27.1 |
| Arrangements | `ArrangementView`, `.arrangementViewStyle(_:)` | `UIArrangementViewController`, `updateArrangement(_:animated:)` | 27.1 |
| Hinge | `.onHingeChange { old, new in }` | `UIHingeInteraction`, `UIHinge` | 27.1 |
| Vertical bar edge | `@Environment(\.toolbarVerticalEdge)` | `traitCollection.verticalBarEdge` | 27.1 |
| Disable vertical bar | `.toolbarVerticalBehavior(.disabled)` | `preferredVerticalBarBehavior` | 27.1 |
| Bar compression | `.toolbarVerticalCompressionBehavior(_:)` | `navigationItem.verticalBarCompressionBehavior` | 27.1 |
| Item axis | `.axisBehavior(_:)` on `ToolbarContent` | `UIBarButtonItem.axisBehavior` | 27.1 |
| Overflow priority | `.visibilityPriority(_:)` | `UIBarButtonItem.visibilityPriority` | 27.0 |
| System overflow menu | `ToolbarOverflowMenu` | `navigationItem.additionalOverflowItems` | 27.0 |
| Sheet placement | `.presentationPlacement(_:)` | `UISheetPresentationController.preferredPlacement` | 27.0 |
| Camera direction | — | `AVCaptureDeviceDirectionCoordinator` (AVKit) | 27.1 |
| Camera accessory | `CameraCaptureAccessory` in `.sceneAccessory { }` | `UISceneAccessory.cameraCapture(...)` | 27.1 |

Gate 27.1-only APIs with `if #available(iOS 27.1, *)` when the deployment target is lower.
They're harmless on other devices: they return no regions, a `nil` hinge, a `nil` edge, and a
coordinator that reports fixed directions.

## Glossary

- **Pose:** a physical configuration (closed, tent, wide, book, tall, laptop).
- **Reserved region:** an area of a view that something else owns. It can be active or inactive.
  - **Division:** splits an area into smaller usable areas (the fold).
  - **Occlusion:** covers part of an area (a camera, the Dynamic Island, window controls).
- **Displacement:** moving or resizing existing elements so they stay out of a reserved region.
- **Arrangement:** a layout container with a primary and a secondary view, in `split` or `overlay` style.
- **Vertical bar:** the side column holding the status bar, Dynamic Island, toolbar and tab bar.
- **Compression:** which bar (toolbar or tab bar) gives up space first when the vertical bar runs out of room.
- **Scene accessory:** extra UI the system can show on another display, such as the outer display during capture.
- **Virtual front camera:** an `AVCaptureDevice` that switches between the inner and outer front cameras automatically.

## References

- [`references/api-reference.md`](references/api-reference.md) links Apple's reference page for
  every API the `iphone-duo-*` skills mention, about 140 links grouped by skill and checked on
  2026-10-14. Open it when you need a full declaration, every case of an enum, or availability.
  It also explains how to fetch the DocC JSON behind each page.
- [`references/sources.md`](references/sources.md) lists the Apple pages and tech talks these
  skills are drawn from, and what each one covers. Use it to find the original for a claim.
