import React from 'react';
import { FrameOverride } from '../../types/assets';
import { BezelFinishId, DynamicSceneId } from '../../types/studio';
import { SmartphoneMockup } from './SmartphoneMockup';

interface DynamicPhoneItem {
  readonly frame: number;
  readonly x: number;
  readonly y: number;
  readonly zIndex: number;
  readonly scale?: number;
  readonly rotateX: number;
  readonly rotateY: number;
  readonly rotateZ: number;
}

interface DynamicSceneConfig {
  readonly perspectivePx: number;
  readonly items: readonly DynamicPhoneItem[];
}

const DYNAMIC_SCENE_CONFIGS: Record<DynamicSceneId, DynamicSceneConfig> = {
  // 1: Single front hero angled left showing sculpted right titanium edge
  'dynamic-1': {
    perspectivePx: 1500,
    items: [
      { frame: 1, x: 0, y: 0, zIndex: 20, scale: 1.0, rotateX: 5, rotateY: -30, rotateZ: -3 },
    ],
  },
  // 2: Two overlapping front phones in counter-tilted stacked hover
  'dynamic-3': {
    perspectivePx: 1650,
    items: [
      { frame: 2, x: -64, y: 156, zIndex: 10, scale: 0.86, rotateX: 16, rotateY: 24, rotateZ: -16 },
      { frame: 1, x: 82, y: -124, zIndex: 25, scale: 0.88, rotateX: 10, rotateY: -32, rotateZ: -15 },
    ],
  },
  // 3: Two parallel diagonal front phones stepped down-right
  'dynamic-4': {
    perspectivePx: 1700,
    items: [
      { frame: 1, x: -176, y: -74, zIndex: 10, scale: 0.92, rotateX: 15, rotateY: 22, rotateZ: -15 },
      { frame: 2, x: 172, y: 80, zIndex: 20, scale: 0.92, rotateX: 15, rotateY: 22, rotateZ: -15 },
    ],
  },
  // 4: Two opposing 3D V-turn front phones (left faces right, right faces left)
  'dynamic-5': {
    perspectivePx: 1600,
    items: [
      { frame: 1, x: -206, y: 66, zIndex: 15, scale: 0.94, rotateX: 10, rotateY: 34, rotateZ: 3 },
      { frame: 2, x: 204, y: -62, zIndex: 20, scale: 0.96, rotateX: 10, rotateY: -34, rotateZ: -3 },
    ],
  },
  // 5: Single floating hero leaning right with dramatic 3D bottom & right-rail reveal
  'dynamic-8': {
    perspectivePx: 1450,
    items: [
      { frame: 1, x: 0, y: 0, zIndex: 20, scale: 0.96, rotateX: 22, rotateY: -28, rotateZ: 22 },
    ],
  },
  // 6: Two upright parallel 3/4 front phones overlapping forward step
  'dynamic-9': {
    perspectivePx: 1650,
    items: [
      { frame: 1, x: -132, y: -96, zIndex: 10, scale: 0.92, rotateX: 8, rotateY: 28, rotateZ: 0 },
      { frame: 2, x: 132, y: 96, zIndex: 20, scale: 0.92, rotateX: 8, rotateY: 28, rotateZ: 0 },
    ],
  },
  // 7: Single low-angle 3/4 hero tilted subtly back showing right rail and bottom ports
  'dynamic-12': {
    perspectivePx: 1450,
    items: [
      { frame: 1, x: 0, y: 0, zIndex: 20, scale: 1.0, rotateX: -8, rotateY: -36, rotateZ: -4 },
    ],
  },
  // 8: Single hero tilted counter-clockwise showing left metallic rail and bottom ports
  'dynamic-14': {
    perspectivePx: 1450,
    items: [
      { frame: 1, x: 0, y: 0, zIndex: 20, scale: 0.98, rotateX: 16, rotateY: 32, rotateZ: -15 },
    ],
  },
};

const EXTRUSION_FINISH_STYLES: Record<
  BezelFinishId,
  { extrusionBg: string; extrusionEdge: string }
> = {
  black: {
    extrusionBg: 'linear-gradient(145deg, #323238 0%, #17171b 50%, #2a2a30 100%)',
    extrusionEdge: 'rgba(255, 255, 255, 0.14)',
  },
  grey: {
    extrusionBg: 'linear-gradient(145deg, #868992 0%, #585a62 50%, #767880 100%)',
    extrusionEdge: 'rgba(255, 255, 255, 0.28)',
  },
  silver: {
    extrusionBg: 'linear-gradient(145deg, #f4f5f8 0%, #c2c5ce 50%, #e4e6ec 100%)',
    extrusionEdge: 'rgba(255, 255, 255, 0.75)',
  },
};

const EXTRUSION_DEPTHS = [-2, -4, -6, -8, -10, -12, -14, -16] as const;

interface DynamicStageProps {
  scene: DynamicSceneId;
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

export const DynamicStage: React.FC<DynamicStageProps> = React.memo(
  ({
    scene,
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
    const config = DYNAMIC_SCENE_CONFIGS[scene];
    const palette = EXTRUSION_FINISH_STYLES[bezelFinish];

    return (
      <div
        style={{
          perspective: `${config.perspectivePx}px`,
          perspectiveOrigin: '50% 50%',
        }}
        className="relative flex items-center justify-center w-[1560px] h-[1160px] select-none"
      >
        {config.items.map((item) => {
          const itemScale = item.scale ?? 1;
          const transformStr = `translate(-50%, -50%) translate3d(${item.x}px, ${item.y}px, 0px) scale(${itemScale}) rotateZ(${item.rotateZ}deg) rotateX(${item.rotateX}deg) rotateY(${item.rotateY}deg)`;

          return (
            <div
              key={`${scene}-frame-${item.frame}`}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                zIndex: item.zIndex,
                transform: transformStr,
                transformStyle: 'preserve-3d',
              }}
              className="transition-transform duration-300 ease-out"
            >
              {/* True 3D metallic chassis extrusion slices */}
              {showBezel &&
                EXTRUSION_DEPTHS.map((depth, sliceIdx) => (
                  <div
                    key={`slice-${depth}`}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '56px',
                      background: palette.extrusionBg,
                      boxShadow:
                        sliceIdx === EXTRUSION_DEPTHS.length - 1
                          ? `inset 0 0 0 1px ${palette.extrusionEdge}, 0 38px 68px rgba(0, 0, 0, 0.34)`
                          : `inset 0 0 0 1px ${palette.extrusionEdge}`,
                      transform: `translateZ(${depth}px)`,
                      pointerEvents: 'none',
                    }}
                  />
                ))}

              <div style={{ transform: 'translateZ(0px)' }} className="relative">
                <SmartphoneMockup
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
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

DynamicStage.displayName = 'DynamicStage';
