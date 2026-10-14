---
name: iphone-duo-bars
description: >
  Navigation bars, toolbars and tab bars on iPhone Duo, where they move to a vertical bar on the side
  of the display. Covers opting in (iOS 27.1 SDK + system containers), which containers and sheets get
  a vertical bar, item ordering (cancellationAction, topBarPinnedTrailing / pinnedTrailingGroup), icon +
  title representation, axisBehavior, badges, custom views, toolbarVerticalEdge / verticalBarEdge,
  toolbar vs tab-bar compression, the system overflow menu, visibilityPriority, and when to disable the
  vertical bar. Use when bars stay horizontal, items go missing or overflow, or when designing toolbars.
---

# iPhone Duo — vertical bars

Which pose gets vertical bars is in [`iphone-duo`](../iphone-duo/SKILL.md#where-bars-go). This
skill covers how to make the app's bars work well there.

## Overview

On the outer display, and on the inner display in landscape, the toolbar, navigation controls and
tab bar move into **one vertical column on the side**. They share it with the status bar and the
Dynamic Island (which grows as Live Activities arrive). Picture the top and bottom bars turned 90°
into a single stack. They're the same components, just laid out differently. Vertical bars have a
**fixed width and flexible item height**, the opposite of horizontal bars, so **symbol-only items**
fit best.

## Instructions

### 1. Opt in

1. Build with the **iOS 27.1 SDK**.
2. Use the bars that **navigation containers** own:
   - SwiftUI: put `.toolbar { }` inside a `NavigationStack` or `NavigationSplitView` (or a `TabView`).
   - UIKit: set `navigationItem` / `toolbarItems` on a view controller inside a
     `UINavigationController` / `UITabBarController`.
   - **The content of a hand-built `UIToolbar`, `UINavigationBar` or `UITabBar` is never moved to the
     vertical bar.** Replace custom bars with container-managed bars.

```swift
NavigationStack {
    ContentView()
        .toolbar {
            ToolbarItem(placement: .bottomBar) { ShareButton() }
        }
}
```

### 2. Know which containers go vertical

Items only move to the vertical bar when their container sits along the display edge.

| Context | Bar axis |
|---|---|
| Split view | Only the **detail** (trailing) column is vertical. Sidebar and content columns stay horizontal. |
| Inspector | Horizontal. An expanded inspector never gets its own vertical bar, because the detail column already has one. |
| Sheet on the outer display | Vertical by default |
| Sheet on the inner display | Centred and horizontal by default. With `presentationPlacement(.trailing)` / `preferredPlacement = .trailing` it gets a vertical bar. Leading or centre placement stays horizontal. |
| Keyboard accessory bar | Stays attached to the keyboard. Never moves to the vertical bar. |
| Right-to-left languages | The bar stays on the same **physical** side. Content flows around it. |

Keep controls with their container. Don't move every control to the side just because you can.
Controls for a leading pane (such as the mailbox list in Mail) stay above that pane.

### 3. Order items top to bottom

1. **Navigation at the very top:** Back or Close. A navigation controller adds Back automatically.
   - Custom Back or Close: SwiftUI `ToolbarItem(placement: .cancellationAction)`. UIKit: put it in
     `navigationItem.leadingItemGroups` and leave `leftItemsSupplementBackButton = false` (the default).
2. **Prominent action next:** such as Done. SwiftUI `ToolbarItem(placement: .topBarPinnedTrailing)`.
   UIKit `navigationItem.pinnedTrailingGroup = UIBarButtonItemGroup(...)`.
3. **Everything else keeps its original groups.** Top-bar items go to the top of the column and
   bottom-bar items to the bottom. The system adds a vertical gap between the two sets. A tab bar
   stays aligned to the bottom.

Group related items with `ToolbarItemGroup` / `UIBarButtonItemGroup`. **Don't add spacing yourself.**
Flexible spacers become zero-size on the vertical axis (fixed spacers keep their minimum size).

### 4. Give every item an icon *and* a title

The system picks the representation for each context:

| Where the item is | Shown as |
|---|---|
| Vertical bar | icon |
| Horizontal bar | icon if there is one, otherwise the title |
| Overflow menu | icon **and** title |

- **An item with only a title never goes vertical.** Neither does a **custom view** unless you opt it in.
- Always provide the title, even for icon items. It's used in overflow and expanded forms, and it
  gives the item a VoiceOver label. Use `Label("Share", systemImage: "square.and.arrow.up")` or set
  both `title` and `image` on `UIBarButtonItem`.
- Keep text buttons to a minimum. Ask whether the text **adds information** or just repeats the
  symbol. If it repeats the symbol, use the symbol alone. If it carries real information (a cart
  button showing a price), keep the item horizontal.
- Turn "symbol + count" into a **badge**, so it becomes a symbol-only item that fits vertically:

```swift
ToolbarItem { InboxButton().badge(7) }   // SwiftUI
item.badge = .count(7)                   // UIKit (iOS 26+)
```

### 5. Set the axis when the default inference is wrong

The default `.automatic` infers the axis from the content. Override it in two cases:

```swift
// Item that switches between a symbol and text (custom Select/Done): keep the pair together
ToolbarItem { SelectOrDoneButton() }
    .axisBehavior(.horizontalOnly)              // UIKit: item.axisBehavior = .horizontalOnly

// Custom view that *can* draw vertically (a compass, an avatar): allow it
ToolbarItem { CompassView() }
    .axisBehavior(.verticalPreferred)           // UIKit: UIBarButtonItem(customView:) + .verticalPreferred
```

- `.horizontalOnly` hides the item entirely when no horizontal bar is present.
- `.verticalPreferred` puts the item in the vertical bar when both bars are present.
- The system `EditButton` already stays horizontal.
- A custom view you opt in must fit the bar's fixed width or switch to a vertical layout. For
  example, hide its titles or make it shorter when vertical.

### 6. Adapt custom UI to the vertical bar

Read the edge from inside the content or the item's custom view:

```swift
@Environment(\.toolbarVerticalEdge) private var edge   // HorizontalEdge? — nil = no vertical bar here
// UIKit: traitCollection.verticalBarEdge  (.unspecified when none)

FloatingToolPalette()
    .frame(maxWidth: .infinity, alignment: edge == .trailing ? .trailing : .leading)
```

The value is the system's *preferred* edge, whether or not a vertical bar is visible right now. It
is `nil` / `.unspecified` only where a vertical bar never appears.

- To extend a hero or background image under the vertical bar, use `.backgroundExtensionEffect()` /
  `UIBackgroundExtensionView`.
- Vertical bars have **no scroll-edge effect** by default. They get a **background when Reduce
  Transparency is on**, so keep custom item content legible on both backgrounds.

### 7. Manage overflow

Overflow happens more on the outer display in landscape (less height), and when the keyboard,
Picture in Picture or Live Activities take up room.

**First, choose which bar gives way** (set per view):

| Experience | Keep visible | API |
|---|---|---|
| Navigation-focused (browsing destinations, as in Podcasts) | tab bar. Toolbar items overflow first. **This is the default.** | `.automatic` / `.prefersTabBar` |
| Task-focused (as in a Games view) | toolbar items. The tab bar minimises to one control. | `.toolbarVerticalCompressionBehavior(.prefersToolbarItems)`. UIKit: `navigationItem.verticalBarCompressionBehavior = .prefersBarItems` |

**Then set item priorities.** Items overflow **from bottom to top** by default. Prioritise
**groups** first, then items within a group if you need finer control:

```swift
ToolbarItem { ComposeButton() }.visibilityPriority(.high)   // UIKit: item.visibilityPriority = .high
// also .low, .automatic / .standard, and init(higherThan:) / init(lowerThan:)
```

Keep the most-used actions visible longest (Compose in Mail, New Note in Notes), along with items
that show **status** (badges).

**Use one system overflow menu.** Move the app's own "more" menu into it:

```swift
.toolbar {
    ToolbarOverflowMenu {
        Button("Scan") { … }
        Button("Connect") { … }
    }
}
// UIKit
navigationItem.additionalOverflowItems = UIDeferredMenuElement { provide in
    provide(self.persistentOverflowItems())
}
```

The **ellipsis** symbol is only for overflow. Give every other menu its own symbol, and don't use
other platforms' overflow glyphs.

### 8. Disable the vertical bar only for real exceptions

Good reasons:
- A single-screen, bottom-heavy, non-scrolling UI where horizontal bars let the content use the full
  width (Calculator, a full-screen video player with toolbar controls).
- A control-heavy sheet with **one** bar item (just Close). Disabling it gives back the width. The
  sheet then stops just short of the front camera and the status bar moves.

```swift
NavigationStack { ContentView().toolbarVerticalBehavior(.disabled) }
// UIKit
override var preferredVerticalBarBehavior: UIVerticalBarBehavior { .disabled }
// call setNeedsUpdateOfVerticalBarConfiguration() if it changes; childForPreferredVerticalBarBehavior delegates
```

- Treat it as a **stable** choice. Don't toggle it as the view's state changes. To hide the bars,
  use `toolbarVisibility(_:for:)` instead.
- How it resolves: `NavigationStack` uses the top view, `TabView` the selected tab,
  `NavigationSplitView` the trailing-most column, and a sheet or form uses its presentation.
- **Don't override the default bar placement in general.** Controls on the side are a core iPhone
  Duo pattern.

### 9. Related bar APIs (iOS 27)

- **iPhone sidebar** on the inner display: SwiftUI `.defaultTabBarPlacement(.sidebar)`. UIKit
  `tabBarController.sidebar.preferredPlacement = .sidebar`, and check `sidebar.isAvailable`. This is an
  app choice and there's no UI toggle. When the sidebar is unavailable, show tab-group destinations
  somewhere else. It works best for information-dense apps (as in Health).
- **Prominent tab** (always visible, even when collapsed): `tabBarController.prominentTabIdentifier = "cart"`.
- **Nav bar minimisation:** `navigationItem.navigationBarMinimization.minimizationBehavior` /
  `.safeAreaAdjustment = .disabled` if you handle safe-area avoidance yourself.

## Done when

- [ ] No hand-built bars. All items come from container-managed bars.
- [ ] Back or Close at the top, the prominent action next, and the original groups kept.
- [ ] Every non-text item has a symbol **and** a title. Counts are badges.
- [ ] Custom views either opt in with `.verticalPreferred` and fit the width, or are `.horizontalOnly` on purpose.
- [ ] Compression behaviour set for task-focused views. Priorities set for groups and key items.
- [ ] One system overflow menu, with the ellipsis used only for it.
- [ ] Checked in outer landscape with the keyboard up, with a Live Activity running, and in Split
      View on both sides.

## API reference

Apple reference links for every API above (full declarations, enum cases, availability):
[`iphone-duo/references/api-reference.md`](../iphone-duo/references/api-reference.md#bars--toolbars-tab-bars-sheets).
Pair with [`references/sources.md`](../iphone-duo/references/sources.md) for the articles and tech talks.
