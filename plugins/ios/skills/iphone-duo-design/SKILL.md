---
name: iphone-duo-design
description: >
  Design, UX and accessibility guidance for iPhone Duo apps, from Apple's HIG and design tech talks —
  for designers, PMs and agents writing specs, critiquing mockups or reviewing builds (no code needed).
  Covers the design principles (one continuous experience, same features and hierarchy in every pose,
  controls on the side, asymmetric layouts, offset vs full-width centring), inner-display strategies,
  sheets and the fold, the tabletop layout, games, and an accessibility checklist; ships a pose-by-pose
  review checklist. Use when designing, specifying or reviewing screens for iPhone Duo.
---

# iPhone Duo — design, UX and accessibility

Device facts are in [`iphone-duo`](../iphone-duo/SKILL.md). The review checklist to run against
mockups or a build is in [`references/review-checklist.md`](references/review-checklist.md).

## Overview

Closed, iPhone Duo is compact and familiar and fits in the hand. Open, it's the largest, most
immersive iPhone display, and it still fits in a pocket. People hold it partly folded like a book,
put it on a table like a laptop, or stand it on its edges. **You are still designing for iPhone**:
the iOS HIG still applies. What's new is **continuity across sizes and poses**.

## Principles

1. **Design for two size classes, not six poses.** Compact width (outer display) and regular width
   (inner display). Avoid fixed widths, breakpoints and metrics tied to one screen. Build with layout
   margins and safe areas. If the app resizes freely, it'll be fine.
2. **One continuous experience.** People open and close the device often in the middle of a task.
   Keep **functionality and the state of each element** the same across displays. Keep the same
   **hierarchy**. The inner display may show **one more level** of it (Mail: list *or* message
   closed, both open). Never limit a feature to one pose.
3. **Don't reinvent the app when it resizes.** Let the existing layout **expand into the space**.
   Avoid big layout changes as the device folds. Move only what's needed to keep things visible and
   tappable. Controls that jump around are hard to find again.
4. **Controls live on the side.** On the outer display, and on the inner display in landscape,
   toolbars, tab bars and navigation controls sit in a vertical column on the side. This is a core
   pattern: **don't override it** in general. It saves vertical space and is reachable with the
   right thumb. Only the inner display in portrait keeps horizontal bars.
5. **Keep control positions consistent across poses.** Not every pose is vertical. Keep each
   control's *relative* place as stable as you can so people don't have to relearn it.
6. **Keep interactive elements out of the fold.** When partially folded, the curve is a natural
   divider. Text and images move away from it. Buttons move to the sides (book pose) or the bottom
   half (tabletop). Scrolling content may cross the fold.

## Layout patterns

### Asymmetry and centring (outer display)

With controls on one edge, the content area is **asymmetric**. Most content needs an **offset**
so the controls don't cover it. Aligning to the horizontal safe-area insets does that automatically.

| Approach | Use for |
|---|---|
| **Inset/offset** (centred in the safe area) | most screens, especially anything that scrolls |
| **Full display width** (centred on the whole display, no bars) | immersive, visual screens that **don't scroll**, where nothing interactive collides with the Dynamic Island or status bar. Calculator turns its 4×5 keypad into 5×4. |
| **Mixed** | a full-width background image or header with **inset scrolling foreground**. Every interactive element stays inside the inset area. |

Watch the **opposite** edge too. In Split View on the inner display, the other app's controls sit
on its outer edge.

### Inner display: don't just stretch

Pick what suits the content:
- **Split view:** show more of the hierarchy at once. When folded, the columns even out to 50/50.
- **Rearranging content:** a vertical stack becomes two columns when wider (as in Music).
- **Sidebar instead of a tab bar:** for information-dense apps (as in Health).
- **Grids:** use an even number of columns, with extra space at the hinge.

### Toolbar design

- Put **Back/Close** at the top, then the **prominent action** (Done), then the remaining groups in
  their original order. Top-bar items go to the top, bottom-bar items to the bottom.
- Every non-text item needs a **symbol and a title**. **Keep text buttons to a minimum**, because
  text keeps an item horizontal. Turn counts into **badges**.
- Decide what stays visible when space runs out: **tab bar** for browsing-focused screens (the
  default), **toolbar** for task-focused ones. Rank priorities: most-used actions and status-bearing
  (badged) items overflow last.
- Use **one system overflow menu** with the ellipsis. Other menus get their own symbol.
- Keep controls **near the content they affect**. Controls for a leading pane stay above that pane.
- Implementation: [`iphone-duo-bars`](../iphone-duo-bars/SKILL.md).

### Sheets

- **Outer display:** sheet controls move to the side by default. For a sheet with a **single**
  button (Close), you can keep the bar horizontal. The sheet then stops just short of the camera.
- **Inner display:** sheets are centred with horizontal bars. Placing a sheet on the trailing side
  gives it a vertical bar.
- **Partially folded:** sheets, alerts, menus and popovers slide out of the fold by themselves.

### Displacement (custom UI around the fold)

Move an element to the region that **suits its purpose**. In the book pose, transient UI like alerts
goes **trailing**, closer to the outer display. In the tabletop pose, things seen from a distance go
**top** and touch controls go **bottom**. Move related elements **together**. Don't move anything far
from its source. Never drop content. See
[`iphone-duo-fold-layouts`](../iphone-duo-fold-layouts/SKILL.md#2-decide-whether-something-should-move-displacement).

### Tabletop layout (optional)

Good for hands-free use: media on top, tappable controls on a **stable bottom**. It must keep **all**
the same controls and hierarchy as the other poses.

### Games

- Playable in **every pose**. You can lock to portrait or landscape, but **fill the screen** as the
  pose changes.
- Keep **text and control sizes** as consistent as possible when resizing.
- **Change the aspect ratio** instead of letterboxing or pillarboxing. If you can't avoid bars, fill
  them with artwork so it still feels full screen.

## Accessibility

Duo-specific points from Apple's guidance, plus the standard iOS practices they depend on:

- **Labels:** every toolbar item has a **title** even if it shows only a symbol. The system uses it
  for overflow and expanded forms, and it's the natural VoiceOver label. Don't ship symbol-only
  custom views without an accessibility label.
- **Reduce Transparency:** vertical bars get a solid background when it's on. Check that custom bar
  content stays legible on that background **and** on the default glass.
- **Reach and motor:** vertical controls sit within thumb reach on purpose. Don't move them
  somewhere harder to reach. Keep interactive elements out of the fold, where precise tapping is
  hard. Don't shrink tap targets to fit a narrower bar. Let items overflow instead.
- **Stable positions help everyone,** especially people using VoiceOver, Switch Control or
  low-vision zoom. Avoid big moves when the device folds, and keep the reading and focus order
  logical after controls move to the side. Top-to-bottom in the vertical bar matches the old
  leading-to-trailing order.
- **Hinge-driven features** need an on-screen alternative. Not everyone can (or wants to) fold the
  device precisely.
- **Dynamic Type:** a narrower outer display and the vertical bar take width. Test the largest text
  sizes in outer landscape and in Split View. Text and controls shouldn't change size when the device
  resizes, only reflow.
- **Right to left:** vertical bars stay on the same **physical** side. Check that content flow and
  focus order still make sense in RTL locales.
- **Pointer and indirect input** (iPhone Mirroring, trackpads): standard sheets and gestures
  support them. Custom ones may not. See [`iphone-duo-testing-launch`](../iphone-duo-testing-launch/SKILL.md).
- **Camera accessory UI** on the outer display is optional. Nobody should depend on seeing it.

## Writing a design spec for a Duo screen

For each screen, state:
1. **Hierarchy** on the outer display versus the inner display (what extra level, if any, the inner display shows).
2. **Bars:** the item list in order with symbol + title, groups, priorities, and toolbar-vs-tab-bar compression preference.
3. **Centring:** inset, full-width or mixed.
4. **Fold behaviour:** which elements move (if any), where, and why. Note what is scrolling content and stays put.
5. **Optional pose extras** (tabletop, hinge effects), each with the same features and a fallback.
6. **Accessibility notes:** labels, large-text behaviour, Reduce Transparency check.

Then run [`references/review-checklist.md`](references/review-checklist.md).
