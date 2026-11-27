import React, { lazy, Suspense, useCallback } from 'react';
import { FrameOverride } from '../types/assets';
import {
  ANGLE_SCENE_LAYOUTS,
  BezelFinishId,
  CHARISMA_SCENE_LAYOUTS,
  HOURGLASS_SCENE_LAYOUTS,
  isAngleScene,
  isCharismaScene,
  isDynamicScene,
  isHourglassScene,
  isLiveActionScene,
  isScribeScene,
  isTerminalScene,
  isWaveScene,
  SCENE_FRAME_INDICES,
  SCRIBE_SCENE_LAYOUTS,
  StudioPageId,
  WAVE_SCENE_LAYOUTS,
} from '../types/studio';
import {
  ResponsiveCharismaWaveLayout,
  ResponsiveGridLayout,
  ResponsiveHourglassLayout,
} from '../hooks/useViewportScale';
import { SmartphoneMockup } from './mockups/SmartphoneMockup';

const AppleWatchMockup = lazy(() =>
  import('./mockups/AppleWatchMockup').then((m) => ({ default: m.AppleWatchMockup }))
);
const DesktopMockup = lazy(() =>
  import('./mockups/DesktopMockup').then((m) => ({ default: m.DesktopMockup }))
);
const DynamicStage = lazy(() =>
  import('./mockups/DynamicStage').then((m) => ({ default: m.DynamicStage }))
);
const LiveActionStage = lazy(() =>
  import('./mockups/LiveActionStage').then((m) => ({ default: m.LiveActionStage }))
);
const TabletMockup = lazy(() =>
  import('./mockups/TabletMockup').then((m) => ({ default: m.TabletMockup }))
);
const WatchMockup = lazy(() =>
  import('./mockups/WatchMockup').then((m) => ({ default: m.WatchMockup }))
);

interface StageCompositionProps {
  activeScene: StudioPageId;
  responsiveGrid: ResponsiveGridLayout | null;
  responsiveCharismaWave: ResponsiveCharismaWaveLayout | null;
  responsiveHourglass: ResponsiveHourglassLayout | null;
  showBezel: boolean;
  bezelFinish: BezelFinishId;
  backgroundTone: number;
  isTransparentBackdrop: boolean;
  isCapturing: boolean;
  customUrl: string | null;
  reloadNonce: number;
  frameOverrides: Record<number, FrameOverride>;
  selectedFrameIndex: number | null;
  onSelectFrame: (frameIndex: number) => void;
  onAssignAssetId: (frameIndex: number, assetId: string) => void;
  onDropFilesOnFrame: (frameIndex: number, files: File[], rejectedCount: number) => void;
  onToggleOverrideFit: (frameIndex: number) => void;
  onClearOverride: (frameIndex: number) => void;
  onOpenAssetTray: () => void;
}

export const StageComposition: React.FC<StageCompositionProps> = React.memo(
  ({
    activeScene,
    responsiveGrid,
    responsiveCharismaWave,
    responsiveHourglass,
    showBezel,
    bezelFinish,
    backgroundTone,
    isTransparentBackdrop,
    isCapturing,
    customUrl,
    reloadNonce,
    frameOverrides,
    selectedFrameIndex,
    onSelectFrame,
    onAssignAssetId,
    onDropFilesOnFrame,
    onToggleOverrideFit,
    onClearOverride,
    onOpenAssetTray,
  }) => {
    const renderPhone = useCallback(
      (frameNum: number) => (
        <SmartphoneMockup
          key={`${activeScene}-frame-${frameNum}`}
          frameIndex={frameNum}
          showBezel={showBezel}
          bezelFinish={bezelFinish}
          backgroundTone={backgroundTone}
          isTransparentBackdrop={isTransparentBackdrop}
          isCapturing={isCapturing}
          customUrl={customUrl}
          reloadNonce={reloadNonce}
          override={frameOverrides[frameNum]}
          isSelected={selectedFrameIndex === frameNum}
          onSelectFrame={onSelectFrame}
          onAssignAssetId={onAssignAssetId}
          onDropFilesOnFrame={onDropFilesOnFrame}
          onToggleOverrideFit={onToggleOverrideFit}
          onClearOverride={onClearOverride}
          onOpenAssetTray={onOpenAssetTray}
        />
      ),
      [
        activeScene,
        showBezel,
        bezelFinish,
        backgroundTone,
        isTransparentBackdrop,
        isCapturing,
        customUrl,
        reloadNonce,
        frameOverrides,
        selectedFrameIndex,
        onSelectFrame,
        onAssignAssetId,
        onDropFilesOnFrame,
        onToggleOverrideFit,
        onClearOverride,
        onOpenAssetTray,
      ]
    );

    if (isAngleScene(activeScene)) {
      const layout = ANGLE_SCENE_LAYOUTS[activeScene];
      return (
        <div
          style={{
            transform: layout.rotateDeg !== 0 ? `rotate(${layout.rotateDeg}deg)` : undefined,
          }}
          className={`flex flex-row items-center justify-center transition-[transform,opacity] duration-200 ease-out ${layout.columnGapClass}`}
        >
          {layout.columns.map((column, colIdx) => (
            <div
              key={`${activeScene}-col-${colIdx}`}
              style={{
                transform: column.offsetY !== 0 ? `translateY(${column.offsetY}px)` : undefined,
              }}
              className={`flex flex-col items-center shrink-0 transition-transform duration-200 ease-out ${layout.rowGapClass}`}
            >
              {column.frames.map(renderPhone)}
            </div>
          ))}
        </div>
      );
    }

    if (isCharismaScene(activeScene) || isWaveScene(activeScene)) {
      const layout = isWaveScene(activeScene)
        ? WAVE_SCENE_LAYOUTS[activeScene]
        : CHARISMA_SCENE_LAYOUTS[activeScene];

      const effectiveRows =
        responsiveCharismaWave?.rows ??
        (layout.rows && layout.rows.length > 0 ? layout.rows : null);
      const effectiveItemGapPx = responsiveCharismaWave?.itemGapPx ?? layout.itemGapPx;
      const effectiveRowGapPx = responsiveCharismaWave?.rowGapPx ?? layout.rowGapPx ?? 56;

      if (effectiveRows && effectiveRows.length > 0) {
        return (
          <div
            style={{ rowGap: effectiveRows.length > 1 ? effectiveRowGapPx : 0 }}
            className="flex flex-col items-center justify-center transition-[transform,opacity] duration-200 ease-out"
          >
            {effectiveRows.map((rowItems, rowIdx) => (
              <div
                key={`${activeScene}-row-${rowIdx}`}
                className="flex flex-row items-center justify-center"
              >
                {rowItems.map((item, idx) => (
                  <div
                    key={`${activeScene}-item-${item.frame}`}
                    style={{
                      marginLeft: idx === 0 ? 0 : effectiveItemGapPx,
                      zIndex: item.zIndex,
                      transform: `translateY(${item.offsetY}px) rotate(${item.rotateDeg}deg)`,
                    }}
                    className="relative shrink-0 transition-transform duration-200 ease-out"
                  >
                    {renderPhone(item.frame)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="flex flex-row items-center justify-center transition-[transform,opacity] duration-200 ease-out">
          {layout.items.map((item, idx) => (
            <div
              key={`${activeScene}-item-${item.frame}`}
              style={{
                marginLeft: idx === 0 ? 0 : effectiveItemGapPx,
                zIndex: item.zIndex,
                transform: `translateY(${item.offsetY}px) rotate(${item.rotateDeg}deg)`,
              }}
              className="relative shrink-0 transition-transform duration-200 ease-out"
            >
              {renderPhone(item.frame)}
            </div>
          ))}
        </div>
      );
    }

    if (isDynamicScene(activeScene)) {
      return (
        <Suspense fallback={null}>
          <DynamicStage
            key={activeScene}
            scene={activeScene}
            showBezel={showBezel}
            bezelFinish={bezelFinish}
            backgroundTone={backgroundTone}
            isTransparentBackdrop={isTransparentBackdrop}
            isCapturing={isCapturing}
            customUrl={customUrl}
            reloadNonce={reloadNonce}
            frameOverrides={frameOverrides}
            selectedFrameIndex={selectedFrameIndex}
            onSelectFrame={onSelectFrame}
            onAssignAssetId={onAssignAssetId}
            onDropFilesOnFrame={onDropFilesOnFrame}
            onToggleOverrideFit={onToggleOverrideFit}
            onClearOverride={onClearOverride}
            onOpenAssetTray={onOpenAssetTray}
          />
        </Suspense>
      );
    }

    if (isTerminalScene(activeScene)) {
      return (
        <Suspense fallback={null}>
          <DesktopMockup
            key={activeScene}
            formFactor={activeScene}
            frameIndex={1}
            showBezel={showBezel}
            bezelFinish={bezelFinish}
            backgroundTone={backgroundTone}
            isTransparentBackdrop={isTransparentBackdrop}
            isCapturing={isCapturing}
            customUrl={customUrl}
            reloadNonce={reloadNonce}
            override={frameOverrides[1]}
            isSelected={selectedFrameIndex === 1}
            onSelectFrame={onSelectFrame}
            onAssignAssetId={onAssignAssetId}
            onDropFilesOnFrame={onDropFilesOnFrame}
            onToggleOverrideFit={onToggleOverrideFit}
            onClearOverride={onClearOverride}
            onOpenAssetTray={onOpenAssetTray}
          />
        </Suspense>
      );
    }

    if (isScribeScene(activeScene)) {
      const layout = SCRIBE_SCENE_LAYOUTS[activeScene];
      return (
        <Suspense fallback={null}>
          <div
            className={`flex flex-row items-center justify-center transition-[transform,opacity] duration-200 ease-out ${layout.gapClass}`}
          >
            {layout.items.map((item) => (
              <TabletMockup
                key={`${activeScene}-tablet-${item.frame}`}
                size={item.size}
                frameIndex={item.frame}
                showBezel={showBezel}
                bezelFinish={bezelFinish}
                backgroundTone={backgroundTone}
                isTransparentBackdrop={isTransparentBackdrop}
                isCapturing={isCapturing}
                customUrl={customUrl}
                reloadNonce={reloadNonce}
                override={frameOverrides[item.frame]}
                isSelected={selectedFrameIndex === item.frame}
                onSelectFrame={onSelectFrame}
                onAssignAssetId={onAssignAssetId}
                onDropFilesOnFrame={onDropFilesOnFrame}
                onToggleOverrideFit={onToggleOverrideFit}
                onClearOverride={onClearOverride}
                onOpenAssetTray={onOpenAssetTray}
              />
            ))}
          </div>
        </Suspense>
      );
    }

    if (isHourglassScene(activeScene)) {
      const layout = HOURGLASS_SCENE_LAYOUTS[activeScene];

      const renderWatch = (frameNum: number) =>
        layout.model === 'apple' ? (
          <AppleWatchMockup
            key={`${activeScene}-watch-${frameNum}`}
            frameIndex={frameNum}
            screenWidthPx={layout.screenWidthPx}
            screenHeightPx={layout.screenHeightPx}
            screenRadiusPx={layout.screenRadiusPx}
            bezelPadPx={layout.bezelPadPx}
            showStraps={layout.showStraps}
            strapLengthPx={layout.strapLengthPx}
            showBezel={showBezel}
            bezelFinish={bezelFinish}
            backgroundTone={backgroundTone}
            isTransparentBackdrop={isTransparentBackdrop}
            isCapturing={isCapturing}
            customUrl={customUrl}
            reloadNonce={reloadNonce}
            override={frameOverrides[frameNum]}
            isSelected={selectedFrameIndex === frameNum}
            onSelectFrame={onSelectFrame}
            onAssignAssetId={onAssignAssetId}
            onDropFilesOnFrame={onDropFilesOnFrame}
            onToggleOverrideFit={onToggleOverrideFit}
            onClearOverride={onClearOverride}
            onOpenAssetTray={onOpenAssetTray}
          />
        ) : (
          <WatchMockup
            key={`${activeScene}-watch-${frameNum}`}
            frameIndex={frameNum}
            screenDiameterPx={layout.screenWidthPx}
            bezelPadPx={layout.bezelPadPx}
            showStraps={layout.showStraps}
            strapLengthPx={layout.strapLengthPx}
            showBezel={showBezel}
            bezelFinish={bezelFinish}
            backgroundTone={backgroundTone}
            isTransparentBackdrop={isTransparentBackdrop}
            isCapturing={isCapturing}
            customUrl={customUrl}
            reloadNonce={reloadNonce}
            override={frameOverrides[frameNum]}
            isSelected={selectedFrameIndex === frameNum}
            onSelectFrame={onSelectFrame}
            onAssignAssetId={onAssignAssetId}
            onDropFilesOnFrame={onDropFilesOnFrame}
            onToggleOverrideFit={onToggleOverrideFit}
            onClearOverride={onClearOverride}
            onOpenAssetTray={onOpenAssetTray}
          />
        );

      if (responsiveHourglass) {
        return (
          <Suspense fallback={null}>
            <div
              style={{ rowGap: responsiveHourglass.gapPx }}
              className="flex flex-col items-center justify-center transition-[transform,opacity] duration-200 ease-out"
            >
              {responsiveHourglass.rows.map((rowFrames, rowIdx) => (
                <div
                  key={`${activeScene}-watch-row-${rowIdx}`}
                  style={{ columnGap: responsiveHourglass.gapPx }}
                  className="flex flex-row items-center justify-center"
                >
                  {rowFrames.map(renderWatch)}
                </div>
              ))}
            </div>
          </Suspense>
        );
      }

      return (
        <Suspense fallback={null}>
          <div
            className={`transition-[transform,opacity] duration-200 ease-out ${layout.containerClass}`}
          >
            {layout.frames.map(renderWatch)}
          </div>
        </Suspense>
      );
    }

    if (isLiveActionScene(activeScene)) {
      return (
        <Suspense fallback={null}>
          <LiveActionStage
            key={activeScene}
            scene={activeScene}
            showBezel={showBezel}
            bezelFinish={bezelFinish}
            backgroundTone={backgroundTone}
            isTransparentBackdrop={isTransparentBackdrop}
            isCapturing={isCapturing}
            customUrl={customUrl}
            reloadNonce={reloadNonce}
            frameOverrides={frameOverrides}
            selectedFrameIndex={selectedFrameIndex}
            onSelectFrame={onSelectFrame}
            onAssignAssetId={onAssignAssetId}
            onDropFilesOnFrame={onDropFilesOnFrame}
            onToggleOverrideFit={onToggleOverrideFit}
            onClearOverride={onClearOverride}
            onOpenAssetTray={onOpenAssetTray}
          />
        </Suspense>
      );
    }

    const visibleFrames = SCENE_FRAME_INDICES[activeScene];

    if (responsiveGrid) {
      const total = visibleFrames.length;
      const rowCount = responsiveGrid.rows;
      const rows: number[][] = [];
      let cursor = 0;
      for (let rowIdx = 0; rowIdx < rowCount; rowIdx += 1) {
        const take = Math.ceil((total - cursor) / (rowCount - rowIdx));
        rows.push(visibleFrames.slice(cursor, cursor + take));
        cursor += take;
      }
      return (
        <div
          className={`flex flex-col items-center justify-center transition-[transform,opacity] duration-200 ease-out ${responsiveGrid.gapClass}`}
        >
          {rows.map((rowFrames, rowIdx) => (
            <div
              key={`${activeScene}-grid-row-${rowIdx}`}
              className={`flex flex-row items-center justify-center ${responsiveGrid.gapClass}`}
            >
              {rowFrames.map(renderPhone)}
            </div>
          ))}
        </div>
      );
    }

    return <>{visibleFrames.map(renderPhone)}</>;
  }
);

StageComposition.displayName = 'StageComposition';
