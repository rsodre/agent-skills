# API reference index

Links to Apple's reference page for every API the `iphone-duo-*` skills mention, grouped by skill.
Every URL was checked on 2026-10-14. Open one when a skill's summary isn't enough: full declarations,
every case of an enum, availability, related symbols and sample code.

**Agent tip:** the HTML pages render with JavaScript. For raw content, fetch the DocC JSON at
`https://developer.apple.com/tutorials/data<path>.json`. For example,
`https://developer.apple.com/tutorials/data/documentation/swiftui/arrangementview.json` gives the
abstract, the declaration, the discussion and the topic list. When a path gives a 404, open the parent
type's page and follow its links. Symbol paths can carry suffixes like `-swift.struct` or
`-swift.property`.

## Resizability — screens, traits, geometry, safe areas

Used by [`iphone-duo-resizability`](../../iphone-duo-resizability/SKILL.md).

- [`UIScreen`](https://developer.apple.com/documentation/uikit/uiscreen)
- [`UIWindow(windowScene:)`](https://developer.apple.com/documentation/uikit/uiwindow/init(windowscene:))
- [`UITraitCollection.displayScale`](https://developer.apple.com/documentation/uikit/uitraitcollection/displayscale)
- [`EnvironmentValues.displayScale`](https://developer.apple.com/documentation/swiftui/environmentvalues/displayscale)
- [`UITraitCollection.horizontalSizeClass`](https://developer.apple.com/documentation/uikit/uitraitcollection/horizontalsizeclass)
- [`UITraitCollection.verticalSizeClass`](https://developer.apple.com/documentation/uikit/uitraitcollection/verticalsizeclass)
- [`EnvironmentValues.horizontalSizeClass`](https://developer.apple.com/documentation/swiftui/environmentvalues/horizontalsizeclass)
- [`UITraitCollection.userInterfaceIdiom`](https://developer.apple.com/documentation/uikit/uitraitcollection/userinterfaceidiom)
- [Automatic trait tracking](https://developer.apple.com/documentation/uikit/automatic-trait-tracking)
- [Adapting your app when traits change](https://developer.apple.com/documentation/uikit/adapting-your-app-when-traits-change)
- [`registerForTraitChanges(_:handler:)`](https://developer.apple.com/documentation/uikit/uitraitchangeobservable-67e94/registerfortraitchanges(_:handler:))
- [`UIWindowScene.effectiveGeometry`](https://developer.apple.com/documentation/uikit/uiwindowscene/effectivegeometry)
- [`windowScene(_:didUpdateEffectiveGeometry:)`](https://developer.apple.com/documentation/uikit/uiwindowscenedelegate/windowscene(_:didupdateeffectivegeometry:))
- [`UIWindowScene.Geometry.isInteractivelyResizing`](https://developer.apple.com/documentation/uikit/uiwindowscene/geometry/isinteractivelyresizing)
- [`UIWindowScene.Geometry.isInterfaceOrientationLocked`](https://developer.apple.com/documentation/uikit/uiwindowscene/geometry/isinterfaceorientationlocked)
- [`prefersInterfaceOrientationLocked`](https://developer.apple.com/documentation/uikit/uiviewcontroller/prefersinterfaceorientationlocked)
- [`viewWillTransition(to:with:)`](https://developer.apple.com/documentation/uikit/uicontentcontainer/viewwilltransition(to:with:))
- [`viewDidLayoutSubviews()`](https://developer.apple.com/documentation/uikit/uiviewcontroller/viewdidlayoutsubviews())
- [`onGeometryChange(for:of:action:)`](https://developer.apple.com/documentation/swiftui/view/ongeometrychange(for:of:action:))
- [`GeometryReader`](https://developer.apple.com/documentation/swiftui/geometryreader)
- [TN3187: Migrating to the UIKit scene-based life cycle](https://developer.apple.com/documentation/technotes/tn3187-migrating-to-the-uikit-scene-based-life-cycle)
- [`UIWindowSceneDelegate`](https://developer.apple.com/documentation/uikit/uiwindowscenedelegate)
- [`UIView.safeAreaInsets`](https://developer.apple.com/documentation/uikit/uiview/safeareainsets)
- [`GeometryProxy.safeAreaInsets`](https://developer.apple.com/documentation/swiftui/geometryproxy/safeareainsets)
- [`UIView.safeAreaLayoutGuide`](https://developer.apple.com/documentation/uikit/uiview/safearealayoutguide)
- [`UIView.layoutMarginsGuide`](https://developer.apple.com/documentation/uikit/uiview/layoutmarginsguide)
- [`ignoresSafeArea(_:edges:)`](https://developer.apple.com/documentation/swiftui/view/ignoressafearea(_:edges:))
- [`ConcentricRectangle`](https://developer.apple.com/documentation/swiftui/concentricrectangle)
- [`UICornerConfiguration`](https://developer.apple.com/documentation/uikit/uicornerconfiguration-swift.struct)
- [`UISceneSizeRestrictions`](https://developer.apple.com/documentation/uikit/uiscenesizerestrictions)
- [`UIRequiresFullScreen`](https://developer.apple.com/documentation/bundleresources/information-property-list/uirequiresfullscreen)
- [`UISplitViewController`](https://developer.apple.com/documentation/uikit/uisplitviewcontroller)
- [`NavigationSplitView`](https://developer.apple.com/documentation/swiftui/navigationsplitview)

## Bars — toolbars, tab bars, sheets

Used by [`iphone-duo-bars`](../../iphone-duo-bars/SKILL.md).

- [`toolbar(content:)`](https://developer.apple.com/documentation/swiftui/view/toolbar(content:))
- [`NavigationStack`](https://developer.apple.com/documentation/swiftui/navigationstack)
- [`UINavigationController`](https://developer.apple.com/documentation/uikit/uinavigationcontroller)
- [`UITabBarController`](https://developer.apple.com/documentation/uikit/uitabbarcontroller)
- [`ToolbarItem`](https://developer.apple.com/documentation/swiftui/toolbaritem)
- [`ToolbarItemGroup`](https://developer.apple.com/documentation/swiftui/toolbaritemgroup)
- [`UIBarButtonItemGroup`](https://developer.apple.com/documentation/uikit/uibarbuttonitemgroup)
- [`ToolbarItemPlacement`](https://developer.apple.com/documentation/swiftui/toolbaritemplacement)
- [`ToolbarItemPlacement.cancellationAction`](https://developer.apple.com/documentation/swiftui/toolbaritemplacement/cancellationaction)
- [`ToolbarItemPlacement.topBarPinnedTrailing`](https://developer.apple.com/documentation/swiftui/toolbaritemplacement/topbarpinnedtrailing)
- [`UINavigationItem.pinnedTrailingGroup`](https://developer.apple.com/documentation/uikit/uinavigationitem/pinnedtrailinggroup)
- [`UINavigationItem.leadingItemGroups`](https://developer.apple.com/documentation/uikit/uinavigationitem/leadingitemgroups)
- [`Label`](https://developer.apple.com/documentation/swiftui/label)
- [`UIBarButtonItem`](https://developer.apple.com/documentation/uikit/uibarbuttonitem)
- [`UIBarButtonItem.Badge`](https://developer.apple.com/documentation/uikit/uibarbuttonitem/badge-swift.struct)
- [`axisBehavior(_:)`](https://developer.apple.com/documentation/swiftui/toolbarcontent/axisbehavior(_:))
- [`ToolbarItemAxisBehavior`](https://developer.apple.com/documentation/swiftui/toolbaritemaxisbehavior)
- [`UIBarButtonItem.axisBehavior`](https://developer.apple.com/documentation/uikit/uibarbuttonitem/axisbehavior-swift.property)
- [`UIBarButtonItem.AxisBehavior`](https://developer.apple.com/documentation/uikit/uibarbuttonitem/axisbehavior-swift.enum)
- [`EnvironmentValues.toolbarVerticalEdge`](https://developer.apple.com/documentation/swiftui/environmentvalues/toolbarverticaledge)
- [`UITraitCollection.verticalBarEdge`](https://developer.apple.com/documentation/uikit/uitraitcollection/verticalbaredge)
- [`backgroundExtensionEffect()`](https://developer.apple.com/documentation/swiftui/view/backgroundextensioneffect())
- [`UIBackgroundExtensionView`](https://developer.apple.com/documentation/uikit/uibackgroundextensionview)
- [`toolbarVerticalCompressionBehavior(_:)`](https://developer.apple.com/documentation/swiftui/view/toolbarverticalcompressionbehavior(_:))
- [`ToolbarVerticalCompressionBehavior`](https://developer.apple.com/documentation/swiftui/toolbarverticalcompressionbehavior)
- [`UINavigationItem.verticalBarCompressionBehavior`](https://developer.apple.com/documentation/uikit/uinavigationitem/verticalbarcompressionbehavior)
- [`UIVerticalBarCompressionBehavior`](https://developer.apple.com/documentation/uikit/uiverticalbarcompressionbehavior)
- [`visibilityPriority(_:)`](https://developer.apple.com/documentation/swiftui/toolbarcontent/visibilitypriority(_:))
- [`ToolbarItemVisibilityPriority`](https://developer.apple.com/documentation/swiftui/toolbaritemvisibilitypriority)
- [`UIBarButtonItem.visibilityPriority`](https://developer.apple.com/documentation/uikit/uibarbuttonitem/visibilitypriority)
- [`UIBarButtonItemVisibilityPriority`](https://developer.apple.com/documentation/uikit/uibarbuttonitemvisibilitypriority)
- [`ToolbarOverflowMenu`](https://developer.apple.com/documentation/swiftui/toolbaroverflowmenu)
- [`UINavigationItem.additionalOverflowItems`](https://developer.apple.com/documentation/uikit/uinavigationitem/additionaloverflowitems)
- [`toolbarVerticalBehavior(_:)`](https://developer.apple.com/documentation/swiftui/view/toolbarverticalbehavior(_:))
- [`ToolbarVerticalBehavior`](https://developer.apple.com/documentation/swiftui/toolbarverticalbehavior)
- [`UIViewController.preferredVerticalBarBehavior`](https://developer.apple.com/documentation/uikit/uiviewcontroller/preferredverticalbarbehavior)
- [`UIVerticalBarBehavior`](https://developer.apple.com/documentation/uikit/uiverticalbarbehavior)
- [`setNeedsUpdateOfVerticalBarConfiguration()`](https://developer.apple.com/documentation/uikit/uiviewcontroller/setneedsupdateofverticalbarconfiguration())
- [`toolbarVisibility(_:for:)`](https://developer.apple.com/documentation/swiftui/view/toolbarvisibility(_:for:))
- [`presentationPlacement(_:)`](https://developer.apple.com/documentation/swiftui/view/presentationplacement(_:))
- [`PresentationPlacement`](https://developer.apple.com/documentation/swiftui/presentationplacement)
- [`UISheetPresentationController.preferredPlacement`](https://developer.apple.com/documentation/uikit/uisheetpresentationcontroller/preferredplacement)
- [`defaultTabBarPlacement(_:)`](https://developer.apple.com/documentation/swiftui/view/defaulttabbarplacement(_:))
- [`UITabBarController.sidebar`](https://developer.apple.com/documentation/uikit/uitabbarcontroller/sidebar-swift.property)
- [`UITabBarController.prominentTabIdentifier`](https://developer.apple.com/documentation/uikit/uitabbarcontroller/prominenttabidentifier)

## Fold layouts — reserved regions and arrangements

Used by [`iphone-duo-fold-layouts`](../../iphone-duo-fold-layouts/SKILL.md).

- [`ReservedRegion`](https://developer.apple.com/documentation/swiftui/reservedregion)
- [`GeometryProxy.reservedRegions(kind:options:layoutDirectionBehavior:)`](https://developer.apple.com/documentation/swiftui/geometryproxy/reservedregions(kind:options:layoutdirectionbehavior:))
- [`ReservedRegion.Kind`](https://developer.apple.com/documentation/swiftui/reservedregion/kind-swift.struct)
- [`ReservedRegion.QueryOptions`](https://developer.apple.com/documentation/swiftui/reservedregion/queryoptions)
- [`ReservedRegion.isActive`](https://developer.apple.com/documentation/swiftui/reservedregion/isactive)
- [`ReservedRegion.margins`](https://developer.apple.com/documentation/swiftui/reservedregion/margins)
- [`UIView.ReservedRegion`](https://developer.apple.com/documentation/uikit/uiview/reservedregion)
- [`UIView.reservedRegions(kind:options:)`](https://developer.apple.com/documentation/uikit/uiview/reservedregions(kind:options:))
- [`UIView.ReservedRegion.QueryOptions`](https://developer.apple.com/documentation/uikit/uiview/reservedregion/queryoptions)
- [`ArrangementView`](https://developer.apple.com/documentation/swiftui/arrangementview)
- [`arrangementViewStyle(_:)`](https://developer.apple.com/documentation/swiftui/view/arrangementviewstyle(_:))
- [`SplitArrangementViewStyle`](https://developer.apple.com/documentation/swiftui/splitarrangementviewstyle)
- [`OverlayArrangementViewStyle`](https://developer.apple.com/documentation/swiftui/overlayarrangementviewstyle)
- [`EnvironmentValues.overlayArrangementZIndex`](https://developer.apple.com/documentation/swiftui/environmentvalues/overlayarrangementzindex)
- [`EnvironmentValues.splitArrangementAxis`](https://developer.apple.com/documentation/swiftui/environmentvalues/splitarrangementaxis)
- [`overlayArrangementEdge(_:)`](https://developer.apple.com/documentation/swiftui/view/overlayarrangementedge(_:))
- [`splitArrangementLayoutRatio(_:)`](https://developer.apple.com/documentation/swiftui/view/splitarrangementlayoutratio(_:))
- [`UIArrangementViewController`](https://developer.apple.com/documentation/uikit/uiarrangementviewcontroller)
- [`updateArrangement(_:animated:)`](https://developer.apple.com/documentation/uikit/uiarrangementviewcontroller/updatearrangement(_:animated:))
- [`UIArrangementViewController.state(for:)`](https://developer.apple.com/documentation/uikit/uiarrangementviewcontroller/state(for:))
- [`UISplitArrangement`](https://developer.apple.com/documentation/uikit/uisplitarrangement-swift.struct)
- [`UIOverlayArrangement`](https://developer.apple.com/documentation/uikit/uioverlayarrangement-swift.struct)

## Hinge, windows and scene accessories

Used by [`iphone-duo-hinge-scenes`](../../iphone-duo-hinge-scenes/SKILL.md).

- [`UIHingeInteraction`](https://developer.apple.com/documentation/uikit/uihingeinteraction)
- [`UIHingeInteraction.Update`](https://developer.apple.com/documentation/uikit/uihingeinteraction/update)
- [`UIHinge`](https://developer.apple.com/documentation/uikit/uihinge)
- [`UIHinge.Status`](https://developer.apple.com/documentation/uikit/uihinge/status-swift.enum)
- [`UIWindowScene.ActivationAction`](https://developer.apple.com/documentation/uikit/uiwindowscene/activationaction)
- [`sceneAccessory(content:)`](https://developer.apple.com/documentation/swiftui/view/sceneaccessory(content:))
- [`SceneAccessoryContent`](https://developer.apple.com/documentation/swiftui/sceneaccessorycontent)
- [`ExternalNonInteractiveAccessory`](https://developer.apple.com/documentation/swiftui/externalnoninteractiveaccessory)
- [`UISceneAccessory`](https://developer.apple.com/documentation/uikit/uisceneaccessory)

## Camera

Used by [`iphone-duo-camera`](../../iphone-duo-camera/SKILL.md).

- [Choosing a camera by the direction it faces](https://developer.apple.com/documentation/avkit/choosing-a-camera-by-the-direction-it-faces)
- [`AVCaptureDeviceDirectionCoordinator`](https://developer.apple.com/documentation/avkit/avcapturedevicedirectioncoordinator)
- [`AVCaptureDeviceDirectionMap`](https://developer.apple.com/documentation/avkit/avcapturedevicedirectionmap)
- [`AVCaptureDeviceDescriptor`](https://developer.apple.com/documentation/avkit/avcapturedevicedescriptor)
- [`AVCaptureDevice.DiscoverySession`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/discoverysession)
- [`builtInOuterUltraWideCamera`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct/builtinouterultrawidecamera)
- [`builtInInnerUltraWideCamera`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/devicetype-swift.struct/builtininnerultrawidecamera)
- [`AVCaptureDevice.activePrimaryConstituent`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/activeprimaryconstituent)
- [`AVCaptureDevice.position`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/position-swift.property)
- [`AVCaptureConnection.automaticallyAdjustsVideoMirroring`](https://developer.apple.com/documentation/avfoundation/avcaptureconnection/automaticallyadjustsvideomirroring)
- [`AVCaptureConnection.isVideoMirrored`](https://developer.apple.com/documentation/avfoundation/avcaptureconnection/isvideomirrored)
- [`AVCaptureDevice.RotationCoordinator`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/rotationcoordinator)
- [Supporting device rotation in your camera app](https://developer.apple.com/documentation/avfoundation/supporting-device-rotation-in-your-camera-app)
- [`AVCaptureVideoPreviewLayer.videoGravity`](https://developer.apple.com/documentation/avfoundation/avcapturevideopreviewlayer/videogravity)
- [`AVCaptureDevice.dynamicAspectRatio`](https://developer.apple.com/documentation/avfoundation/avcapturedevice/dynamicaspectratio)
- [`isCameraSensorOrientationCompensationEnabled`](https://developer.apple.com/documentation/avfoundation/avcapturephotooutput/iscamerasensororientationcompensationenabled)
- [Registering a camera capture accessory on iPhone Duo](https://developer.apple.com/documentation/avfoundation/registering-a-camera-capture-accessory-on-iphone-duo)
- [`CameraCaptureAccessory`](https://developer.apple.com/documentation/swiftui/cameracaptureaccessory)
- [`onAvailabilityChange(perform:)`](https://developer.apple.com/documentation/swiftui/sceneaccessorycontent/onavailabilitychange(perform:))
- [`UISceneAccessory.cameraCapture(sceneConfiguration:userInfo:)`](https://developer.apple.com/documentation/uikit/uisceneaccessory/cameracapture(sceneconfiguration:userinfo:))
- [`registerSceneAccessory(_:)`](https://developer.apple.com/documentation/uikit/uiviewcontroller/registersceneaccessory(_:))
- [`unregisterSceneAccessory(_:)`](https://developer.apple.com/documentation/uikit/uiviewcontroller/unregistersceneaccessory(_:))
- [`UISceneAccessoryRegistration`](https://developer.apple.com/documentation/uikit/uisceneaccessoryregistration)
- [`UISceneSession.Role.windowCameraCaptureAccessory`](https://developer.apple.com/documentation/uikit/uiscenesession/role-swift.struct/windowcameracaptureaccessory)

## Testing and iPhone Mirroring

Used by [`iphone-duo-testing-launch`](../../iphone-duo-testing-launch/SKILL.md).

- [Device Hub](https://developer.apple.com/documentation/xcode/device-hub)
- [Running your app on simulated or physical devices](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices)
- [TN3210: Optimizing your app for iPhone Mirroring](https://developer.apple.com/documentation/technotes/tn3210-optimizing-your-app-for-iphone-mirroring)
- [`UIApplicationSupportsIndirectInputEvents`](https://developer.apple.com/documentation/bundleresources/information-property-list/uiapplicationsupportsindirectinputevents)
- [`UIPanGestureRecognizer.allowedScrollTypesMask`](https://developer.apple.com/documentation/uikit/uipangesturerecognizer/allowedscrolltypesmask)
- [`LAPolicy.deviceOwnerAuthenticationWithBiometricsOrCompanion`](https://developer.apple.com/documentation/localauthentication/lapolicy/deviceownerauthenticationwithbiometricsorcompanion)
- [`GCMouse`](https://developer.apple.com/documentation/gamecontroller/gcmouse)
