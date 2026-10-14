---
name: iphone-duo-fold-layouts
description: >
  Laying out content around the fold and the cameras on iPhone Duo. Covers reserved regions (division =
  fold, occlusion = cameras / Dynamic Island) via GeometryProxy.reservedRegions and UIView.reservedRegions,
  active vs inactive regions, the displacement design pattern (what moves, where, how far), per-pose
  region purposes (book vs tabletop), ArrangementView / UIArrangementViewController with split and
  overlay styles, axes, z-index and sizing, split views and grids around the fold. Use when content or
  controls land in the fold, a centred layout breaks when partially folded, or building a two-pane or
  player/overlay layout.
---

# iPhone Duo — fold-aware layouts

Facts about the regions (when each is active) are in [`iphone-duo`](../iphone-duo/SKILL.md#anatomy).

## Overview

When iPhone Duo is partially folded, the inner display curves through the centre, like a photo
across a book's spine. Content and controls in the fold are hard to see and to tap. iOS describes
this space with **reserved regions**:

- **Division:** the fold. It splits a view into smaller usable areas. Active only when the device is
  *partially* open. When flat, it's inactive and has zero width.
- **Occlusion:** the inner front camera (active only while the camera runs), the outer front camera
  (always), the Dynamic Island and window controls.

Use the tools in this order: **system components → arrangement views → reserved-regions API.**

## Instructions

### 1. Let system components do it first

Without any work from you, the system already:
- moves **alerts, action sheets, context menus, popovers, sheets and toolbar buttons** out of the fold.
- evens out **split view** columns (`NavigationSplitView` / `UISplitViewController`) to a **50/50**
  split with matching margins when folded (for example, Notes' narrow sidebar widens to half).
- collapses split views to one stack on the outer display and expands them on the inner display.
- in the partially folded book pose, moves alerts to the **trailing** side, which is closer to where
  they'll be when the device closes.

So: prefer these components over custom popups, panels and sheets.

### 2. Decide whether something should move (displacement)

**Displacement** changes the frame of existing elements so they stay visible, reachable and clear
of the fold. Rules:

- **Scrolling content doesn't move.** Articles, feeds, documents and lists already adapt by
  scrolling. Moving them interrupts reading. They don't need to avoid the fold. *Interactive
  elements* do.
- **Choose the scope.** Move an element on its own if it can adapt alone. Move elements **together**
  when they work together (a selected photo and its context menu move as a pair and line up around
  the fold).
- **Don't move things far.** Moving an element far from its source weakens the connection. Prefer
  small adjustments to rearranging.
- **Let the pose and the purpose pick the region:**

| Pose | Top / leading region | Bottom / trailing region |
|---|---|---|
| Book (vertical fold) | content | alerts and transient UI go **trailing**, closer to the outer display |
| Tabletop / laptop (horizontal fold) | content seen **from a distance**: media, alerts | **interactive controls**: a stable surface for touch (media controls) |

- **Stay in context when more than one region would work.** A focused search field sits over the
  view it searches and resizes to that half when the device folds.
- **Adapt the properties, not just the position.** Size, spacing and visual properties can change too.
  For a grid, keep the outer margins and **widen the gap around the hinge** so each tile stays
  within one half.
- **Grids:** prefer an **even** number of columns so content splits cleanly. Decide this even when
  the division is *inactive* (see step 4).
- **Never drop content or functionality** in any pose. Move it, resize it or reorganise it.

### 3. Use an arrangement view for two-part layouts

`ArrangementView` (SwiftUI) / `UIArrangementViewController` (UIKit), iOS 27.1+, is a **layout
container** between navigation containers and content containers. It lays out a **primary** and a
**secondary** view from the size classes, the aspect ratio and active divisions.

| Style | Behaviour | Use when |
|---|---|---|
| `.split` (default) | Side by side when wider than tall. Stacked (primary on top) when taller than wide. Moves around the fold. | Main and detail content where **neither may be hidden** (Now Playing + transcript). It replaces an `HStack`/`VStack`. |
| `.overlay` | Primary layered **over** secondary when nothing divides the area (closed or flat). When partially folded, primary goes to the trailing/bottom region and secondary to the leading/top. | Foreground and background content where partly covering the background is OK (reader controls over scrolling text, player controls over video). It replaces a `ZStack`. |

```swift
NavigationStack {                                   // navigation OUTSIDE the arrangement
    ArrangementView {
        PlayerView()
    } secondary: {
        UpNextView()
    }
    .arrangementViewStyle(.split.axes(.horizontal)) // only split side-by-side; else show primary alone
}
```

```swift
let arrangementVC = UIArrangementViewController()
let nav = UINavigationController(rootViewController: arrangementVC)
arrangementVC.setViewController(PlayerViewController(), for: .primary)
arrangementVC.setViewController(UpNextViewController(), for: .secondary)
arrangementVC.updateArrangement(.split.axes(.horizontal))   // or .overlay / .overlay.axes(...)
```

- **Axes:** if a split can't split along the current primary axis, it shows **only the primary** view.
- **Overlay z-index:** react when the secondary view moves out from under the primary one (for
  example, expand a collapsed "Up Next" when it gets its own half):

```swift
struct UpNextView: View {
    @Environment(\.overlayArrangementZIndex) private var zIndex: Int
    var body: some View { UpNextList(collapsed: zIndex > 0) }
}
// UIKit
let state = arrangementVC.state(for: .primary)
model.collapsed = (state?.zIndex ?? 0) > 0
```

- **Sizing (SwiftUI):** `splitArrangementLayoutRatio(_:)`, `splitArrangementLayoutSize(min…max…)`,
  `splitArrangementFixedLayoutSize(horizontal:vertical:)`, `overlayArrangementEdge(_:)` (which side a
  view takes when the overlay goes horizontal), and `@Environment(\.splitArrangementAxis)`.
- **Never** put navigation containers (`NavigationSplitView`, `TabView`) **inside** an arrangement.
  Arrangements lay out content and don't navigate.
- **Never** put an arrangement inside a `List`, `ScrollView` or other scrolling container. Part of
  it may become unreachable.

### 4. Use reserved regions for custom views

For hand-placed controls, custom bars or edge-to-edge UI:

```swift
// SwiftUI — from GeometryReader or onGeometryChange
GeometryReader { proxy in
    let folds   = proxy.reservedRegions(kind: .division)
    let cameras = proxy.reservedRegions(kind: .occlusion)
    let allFolds = proxy.reservedRegions(kind: .division, options: .includeInactive)
    RegionAvoidingLayout(regions: folds.filter(\.isActive).map(\.frame)) { … }
}
```

```swift
// UIKit — in layoutSubviews / viewDidLayoutSubviews
let folds = view.reservedRegions(kind: .division)
let frames = folds.filter(\.isActive).map(\.frame)
```

- Each region has `frame` (in the view's coordinate space, **including** `margins` for interactive
  content), `isActive`, `kind` and `id`.
- **Always check `isActive`.** The docs and the tech talk disagree on whether inactive regions come
  back by default. Pass `.includeInactive` when you want them, for example to choose even grid
  columns whenever the device *can* fold.
- **Right to left:** SwiftUI mirrors region frames to match the layout direction by default, so a
  custom `Layout` doesn't need to flip them. Pass `layoutDirectionBehavior: .fixed` when you need
  physical coordinates.
- Re-query on every layout pass. Regions change as the device folds or the camera turns on.
- If the camera viewfinder is central to the experience, keep important content and controls clear
  of the **inner camera** region.
- For effects driven by the hinge *angle*, use the hinge API in
  [`iphone-duo-hinge-scenes`](../iphone-duo-hinge-scenes/SKILL.md). Layout should come from regions
  and arrangements, not the angle.

### 5. Use the inner display well

Don't just stretch the iPhone layout. Choose one approach, and keep the **same hierarchy** as on the
outer display:
- **Split view** to show one more level of hierarchy. For example, Mail shows the list *or* the
  message when closed, and both when open.
- **Rearranging content**: a vertical stack becomes two columns when there's room (as in Music).
- **Tab bar as sidebar** for information-dense apps (see [`iphone-duo-bars`](../iphone-duo-bars/SKILL.md#9-related-bar-apis-ios-27)).

### 6. Tabletop pose (optional)

An optional extra: in the laptop pose, put media at the **top** and tappable controls on the stable
**bottom** half. It must keep the **same controls and hierarchy** as every other pose. Never make a
feature available in only one pose.

## Done when

- [ ] Every centred layout is checked when partially folded, in both the book and tabletop poses.
- [ ] No interactive element sits in the fold. Scrolling content may cross it.
- [ ] Custom two-part layouts use `ArrangementView` / `UIArrangementViewController`, with navigation outside.
- [ ] Custom controls use `reservedRegions`, check `isActive`, and re-query on layout.
- [ ] Grids use an even number of columns and leave a gap at the hinge.
- [ ] Every pose has the same features.

## API reference

Apple reference links for every API above (full declarations, enum cases, availability):
[`iphone-duo/references/api-reference.md`](../iphone-duo/references/api-reference.md#fold-layouts--reserved-regions-and-arrangements).
Pair with [`references/sources.md`](../iphone-duo/references/sources.md) for the articles and tech talks.
