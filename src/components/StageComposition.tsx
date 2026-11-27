import React from 'react';
import { FrameOverride } from '../types/assets';
import {
  ANGLE_SCENE_LAYOUTS,
  BezelFinishId,
  CHARISMA_SCENE_LAYOUTS,
  HOURGLASS_SCENE_LAYOUTS,
  isAngleScene,
  isCharismaScene,
  isHourglassScene,
  isScribeScene,
  isTerminalScene,
  SCENE_FRAME_INDICES,
  SCRIBE_SCENE_LAYOUTS,
  StudioPageId,
} from '../types/studio';
import { DesktopMockup } from './DesktopMockup';
import { SmartphoneMockup } from './SmartphoneMockup';
import { TabletMockup } from './TabletMockup';
import { WatchMockup } from './WatchMockup';

interface StageCompositionProps {
  activeScene: StudioPageId;
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
    const renderPhone = (frameNum: number) => (
      <SmartphoneMockup
        key={`frame-${frameNum}`}
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

    if (isCharismaScene(activeScene)) {
      const layout = CHARISMA_SCENE_LAYOUTS[activeScene];
      return (
        <div className="flex flex-row items-center justify-center transition-[transform,opacity] duration-200 ease-out">
          {layout.items.map((item, idx) => (
            <div
              key={`${activeScene}-item-${item.frame}`}
              style={{
                marginLeft: idx === 0 ? 0 : layout.itemGapPx,
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

    if (isTerminalScene(activeScene)) {
      return (
        <DesktopMockup
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
      );
    }

    if (isScribeScene(activeScene)) {
      const layout = SCRIBE_SCENE_LAYOUTS[activeScene];
      return (
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
      );
    }

    if (isHourglassScene(activeScene)) {
      const layout = HOURGLASS_SCENE_LAYOUTS[activeScene];
      return (
        <div
          className={`transition-[transform,opacity] duration-200 ease-out ${layout.containerClass}`}
        >
          {layout.frames.map((frameNum) => (
            <WatchMockup
              key={`${activeScene}-watch-${frameNum}`}
              frameIndex={frameNum}
              screenDiameterPx={layout.screenDiameterPx}
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
          ))}
        </div>
      );
    }

    const visibleFrames = SCENE_FRAME_INDICES[activeScene];
    return <>{visibleFrames.map(renderPhone)}</>;
  }
);

StageComposition.displayName = 'StageComposition';
