#!/usr/bin/env bash
# Grep a Swift / Objective-C / plist project for patterns that break on iPhone Duo and other
# resizable environments. Prints hits grouped by category with file:line. Read-only.
#
# usage: audit-resizability.sh [project-dir]   (default: .)
# exit:  0 = no hits, 1 = hits found, 2 = bad usage

set -u
root="${1:-.}"
[ -d "$root" ] || { echo "not a directory: $root" >&2; exit 2; }

if command -v rg >/dev/null 2>&1; then
  search() { rg --no-heading --line-number --color never -g '*.swift' -g '*.m' -g '*.mm' -g '*.h' \
    -g '!**/Pods/**' -g '!**/Carthage/**' -g '!**/.build/**' -g '!**/DerivedData/**' -e "$1" "$root"; }
  search_plist() { rg --no-heading --line-number --color never -g '*.plist' -g '*.xcconfig' -g '*.pbxproj' \
    -g '!**/Pods/**' -g '!**/DerivedData/**' -e "$1" "$root"; }
else
  search() { grep -rnE --include='*.swift' --include='*.m' --include='*.mm' --include='*.h' \
    --exclude-dir=Pods --exclude-dir=Carthage --exclude-dir=.build --exclude-dir=DerivedData -e "$1" "$root"; }
  search_plist() { grep -rnE --include='*.plist' --include='*.xcconfig' --include='*.pbxproj' \
    --exclude-dir=Pods --exclude-dir=DerivedData -e "$1" "$root"; }
fi

total=0
check() { # check <search-fn> <category> <advice> <regex>
  local fn="$1" cat="$2" advice="$3" re="$4" out n
  out="$($fn "$re" 2>/dev/null)"
  [ -z "$out" ] && return
  n="$(printf '%s\n' "$out" | wc -l | tr -d ' ')"
  total=$((total + n))
  printf '\n## %s (%s)\n→ %s\n%s\n' "$cat" "$n" "$advice" "$out"
}

check search "screen: main screen" \
  "Size from view/window bounds or GeometryReader; scale from traitCollection.displayScale / \\.displayScale; screen from view.window?.windowScene?.screen" \
  'UIScreen\.main|\[UIScreen mainScreen\]|UIScreen\.screens'
check search "screen: window from frame" \
  "Create windows with UIWindow(windowScene:)" \
  'UIWindow\(frame:|initWithFrame:\[\[UIScreen'
check search "screen: stored UIScreen" \
  "Don't store a UIScreen; look it up dynamically or pass it in" \
  '(var|let)[[:space:]]+[A-Za-z_]+[[:space:]]*:[[:space:]]*UIScreen'
check search "orientation: layout from orientation" \
  "Compare bounds.width vs bounds.height or use size classes; the inner display ignores supported orientations" \
  'UIDevice\.current\.orientation|statusBarOrientation|\.interfaceOrientation|isLandscape|isPortrait'
check search "idiom: layout from idiom" \
  "Choose layout by size class / available space; an iPhone app can be regular width" \
  'userInterfaceIdiom|UI_USER_INTERFACE_IDIOM|\.pad\b|\.phone\b'
check search "idiom: regular-width treated as iPad (review)" \
  "Regular width now happens on iPhone (inner display, Mirroring); confirm the branch isn't an 'iPad-only' layout" \
  'horizontalSizeClass[[:space:]]*==[[:space:]]*\.regular|isIPad|isPad\b'
check search "device-size: hard-coded iPhone dimensions" \
  "Remove device-size checks; they won't match iPhone Duo" \
  '(height|width)[[:space:]]*(==|>=|<=|<|>)[[:space:]]*(568|667|736|812|844|852|874|896|926|932|956|320|375|390|393|402|414|428|430|440)(\.0)?\b'
check search "safe-area: symmetric inset assumption" \
  "Insets are asymmetric with vertical bars; use bounds.inset(by: safeAreaInsets)" \
  'safeAreaInsets\.(left|right|top|bottom)[[:space:]]*\*[[:space:]]*2'
check search "media: aspect fill (review)" \
  "Full-bleed fill can crop the subject on wide displays; choose fill vs fit by size/aspect or set a focal point" \
  'scaleAspectFill|contentMode:[[:space:]]*\.fill|\.scaledToFill\(\)|resizeAspectFill'
check search "bars: custom bar views" \
  "Custom UIToolbar/UINavigationBar/UITabBar content never goes vertical; use the bars of UINavigationController/UITabBarController or SwiftUI .toolbar on a NavigationStack" \
  'UIToolbar\(|UINavigationBar\(|UITabBar\(|\[\[UIToolbar alloc|\[\[UINavigationBar alloc|\[\[UITabBar alloc'
check search "bars: custom overflow menu (review)" \
  "Move actions into the system overflow (ToolbarOverflowMenu / additionalOverflowItems); reserve the ellipsis for it" \
  '"ellipsis(\.circle)?(\.fill)?"'
check search "bars: manual spacing in toolbars (review)" \
  "Use ToolbarItemGroup / UIBarButtonItemGroup instead of manual spacers; flexible spacers collapse to zero in vertical bars" \
  'ToolbarSpacer\(|\.flexibleSpace|fixedSpace\('
check search "auth: biometrics-only policy" \
  "Use .deviceOwnerAuthenticationWithBiometricsOrCompanion so iPhone Mirroring works" \
  'deviceOwnerAuthenticationWithBiometrics\b'
check search "camera: direction from position (review)" \
  "On iPhone Duo position != facing direction; use AVCaptureDeviceDirectionCoordinator (see iphone-duo-camera)" \
  'position[[:space:]]*==[[:space:]]*\.(front|back)|isVideoMirrored[[:space:]]*='
check search_plist "plist: UIRequiresFullScreen" \
  "Adaptive apps should remove it; it now means discrete resizing, not opt-out" \
  'UIRequiresFullScreen'
check search_plist "plist: indirect input disabled" \
  "Remove or set UIApplicationSupportsIndirectInputEvents to YES for iPhone Mirroring" \
  'UIApplicationSupportsIndirectInputEvents'

manifest="$(search_plist 'UIApplicationSceneManifest' 2>/dev/null)"
swiftui_app="$(search '@main[[:space:]]*$|@main[[:space:]]+struct' 2>/dev/null)"
if [ -z "$manifest" ] && [ -z "$swiftui_app" ]; then
  total=$((total + 1))
  printf '\n## lifecycle: no scene manifest found (1)\n→ UIScene lifecycle is required with the iOS 27 SDK; the app will not launch without it\n'
fi

printf '\n%s hit(s). Review each in context; "(review)" categories are often legitimate.\n' "$total"
[ "$total" -eq 0 ] && exit 0 || exit 1
