import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCw,
  X,
} from 'lucide-react';
import liveActionAudioImg from '../../assets/images/live_action_audio_1795797945911.jpg';
import liveActionDrapedImg from '../../assets/images/live_action_draped_1795796833718.jpg';
import liveActionGripImg from '../../assets/images/live_action_grip_1795797903508.jpg';
import liveActionOakImg from '../../assets/images/live_action_oak_1795797904294.jpg';
import liveActionStandImg from '../../assets/images/live_action_stand_1795797939761.jpg';
import liveActionTableImg from '../../assets/images/live_action_table_v2_1795797944720.jpg';
import liveActionTileImg from '../../assets/images/live_action_tile_1795797941029.jpg';
import liveActionTuftedImg from '../../assets/images/live_action_tufted_1795797945142.jpg';
import { useFrameDropZone } from '../../hooks/useFrameDropZone';
import { useIframeStatus } from '../../hooks/useIframeStatus';
import { FrameOverride } from '../../types/assets';
import { BezelFinishId, LiveActionSceneId } from '../../types/studio';
import { SmartphoneMockup } from './SmartphoneMockup';

const LIVE_ACTION_CANVAS_WIDTH = 1376;
const LIVE_ACTION_CANVAS_HEIGHT = 768;

const EMBEDDED_SCREEN_WIDTH = 390;
const EMBEDDED_SCREEN_HEIGHT = 844;

type Point2D = readonly [number, number];
type QuadCorners = readonly [Point2D, Point2D, Point2D, Point2D];

interface EmbeddedScreenPlacement {
  readonly frame: number;
  readonly corners: QuadCorners;
  readonly borderRadiusPx: number;
  readonly glassGlareGradient: string;
}

interface ComposedPhonePlacement {
  readonly frame: number;
  readonly leftPct: number;
  readonly topPct: number;
  readonly scale: number;
  readonly rotateDeg: number;
  readonly shadowFilter: string;
}

interface LiveActionSceneConfig {
  readonly imageUrl: string;
  readonly alt: string;
  readonly fallbackGradient: string;
  readonly imageFilter?: string;
  readonly embeddedScreens?: readonly EmbeddedScreenPlacement[];
  readonly composedPhones?: readonly ComposedPhonePlacement[];
}

const LIVE_ACTION_CONFIGS: Record<LiveActionSceneId, LiveActionSceneConfig> = {
  'live-oak': {
    imageUrl: liveActionOakImg,
    alt: 'Sunlit natural light-oak desk corner with a smartphone and soft-focus ceramic planter',
    fallbackGradient: 'linear-gradient(145deg, #cbb79d 0%, #9f8a70 100%)',
    embeddedScreens: [
      {
        frame: 1,
        corners: [
          [876.2, 278.4],
          [1000.0, 354.5],
          [710.4, 518.2],
          [574.6, 431.9],
        ],
        borderRadiusPx: 50,
        glassGlareGradient:
          'linear-gradient(124deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 38%, transparent 62%)',
      },
    ],
  },
  'live-stand': {
    imageUrl: liveActionStandImg,
    alt: 'Sunlit studio desk with a travertine marble stand holding a silver smartphone',
    fallbackGradient: 'linear-gradient(145deg, #dfd4c2 0%, #b7a892 100%)',
    embeddedScreens: [
      {
        frame: 1,
        corners: [
          [579.3, 155.3],
          [747.8, 141.5],
          [813.4, 557.6],
          [645.8, 587.7],
        ],
        borderRadiusPx: 46,
        glassGlareGradient:
          'linear-gradient(116deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 36%, transparent 60%)',
      },
    ],
  },
  'live-audio': {
    imageUrl: liveActionAudioImg,
    alt: 'Overhead flat-lay of weathered dark walnut wood with matte white wireless earbuds',
    fallbackGradient: 'linear-gradient(145deg, #4b392b 0%, #261b13 100%)',
    composedPhones: [
      {
        frame: 1,
        leftPct: 56,
        topPct: 50,
        scale: 0.72,
        rotateDeg: 0,
        shadowFilter:
          'drop-shadow(16px 24px 32px rgba(8, 5, 3, 0.56)) drop-shadow(4px 7px 12px rgba(8, 5, 3, 0.36))',
      },
    ],
  },
  'live-tile': {
    imageUrl: liveActionTileImg,
    alt: 'Monochrome overhead architectural matte charcoal-slate concrete tiles with diagonal sunlight and shadow',
    fallbackGradient: 'linear-gradient(145deg, #565a5e 0%, #2d3034 100%)',
    imageFilter: 'grayscale(1) brightness(0.68) contrast(1.14) sepia(0.09) hue-rotate(184deg) saturate(1.25)',
    composedPhones: [
      {
        frame: 1,
        leftPct: 50,
        topPct: 50,
        scale: 0.65,
        rotateDeg: -38,
        shadowFilter:
          'drop-shadow(-18px 22px 28px rgba(10, 12, 16, 0.52)) drop-shadow(-5px 7px 12px rgba(10, 12, 16, 0.34))',
      },
    ],
  },
  'live-tufted': {
    imageUrl: liveActionTuftedImg,
    alt: 'Monochrome overhead close-up of a plush tufted matte charcoal-slate velvet upholstered cushion',
    fallbackGradient: 'linear-gradient(145deg, #565a5e 0%, #2d3034 100%)',
    imageFilter: 'grayscale(1) contrast(1.36) brightness(0.88) sepia(0.09) hue-rotate(184deg) saturate(1.25)',
    composedPhones: [
      {
        frame: 1,
        leftPct: 50,
        topPct: 50,
        scale: 0.66,
        rotateDeg: 22,
        shadowFilter:
          'drop-shadow(14px 22px 28px rgba(10, 12, 16, 0.52)) drop-shadow(3px 6px 10px rgba(10, 12, 16, 0.34))',
      },
    ],
  },
  'live-draped': {
    imageUrl: liveActionDrapedImg,
    alt: 'Monochrome sculptural matte charcoal-slate draped linen-silk ripples',
    fallbackGradient: 'linear-gradient(145deg, #565a5e 0%, #2d3034 100%)',
    imageFilter: 'grayscale(1) brightness(0.76) contrast(0.96) sepia(0.09) hue-rotate(184deg) saturate(1.25)',
    composedPhones: [
      {
        frame: 1,
        leftPct: 49.5,
        topPct: 50,
        scale: 0.65,
        rotateDeg: -16,
        shadowFilter:
          'drop-shadow(18px 26px 34px rgba(10, 12, 16, 0.48)) drop-shadow(4px 8px 14px rgba(10, 12, 16, 0.30))',
      },
    ],
  },
  'live-table': {
    imageUrl: liveActionTableImg,
    alt: 'Architectural high-angle view of a smartphone resting on a matte charcoal-slate side table',
    fallbackGradient: 'linear-gradient(145deg, #565a5e 0%, #2d3034 100%)',
    embeddedScreens: [
      {
        frame: 1,
        corners: [
          [816.7, 172.0],
          [960.6, 270.9],
          [644.7, 507.1],
          [503.4, 394.1],
        ],
        borderRadiusPx: 50,
        glassGlareGradient:
          'linear-gradient(122deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 38%, transparent 62%)',
      },
    ],
  },
  'live-grip': {
    imageUrl: liveActionGripImg,
    alt: 'Minimalist studio close-up of a dark-silhouetted hand holding an upright smartphone',
    fallbackGradient: 'linear-gradient(145deg, #d5d7da 0%, #aeb1b5 100%)',
    embeddedScreens: [
      {
        frame: 1,
        corners: [
          [561.5, 101.5],
          [814.5, 101.5],
          [814.5, 657.5],
          [561.5, 657.5],
        ],
        borderRadiusPx: 46,
        glassGlareGradient:
          'linear-gradient(132deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 34%, transparent 56%)',
      },
    ],
  },
};

/**
 * Solves an exact 2D planar perspective homography mapping
 * (0,0)->TL, (w,0)->TR, (w,h)->BR, (0,h)->BL into a CSS column-major matrix3d string.
 */
function computePerspectiveMatrix3d(
  srcWidth: number,
  srcHeight: number,
  corners: QuadCorners
): string {
  const src: readonly Point2D[] = [
    [0, 0],
    [srcWidth, 0],
    [srcWidth, srcHeight],
    [0, srcHeight],
  ];

  const matrix: number[][] = [];
  const rhs: number[] = [];

  for (let i = 0; i < 4; i += 1) {
    const [sx, sy] = src[i];
    const [dx, dy] = corners[i];
    matrix.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    rhs.push(dx);
    matrix.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    rhs.push(dy);
  }

  // Gaussian elimination with partial pivoting
  const n = 8;
  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    let maxAbs = Math.abs(matrix[col][col]);
    for (let row = col + 1; row < n; row += 1) {
      const absVal = Math.abs(matrix[row][col]);
      if (absVal > maxAbs) {
        maxAbs = absVal;
        pivotRow = row;
      }
    }
    if (pivotRow !== col) {
      [matrix[col], matrix[pivotRow]] = [matrix[pivotRow], matrix[col]];
      [rhs[col], rhs[pivotRow]] = [rhs[pivotRow], rhs[col]];
    }

    const pivot = matrix[col][col];
    if (Math.abs(pivot) < 1e-12) {
      return 'none';
    }

    for (let c = col; c < n; c += 1) {
      matrix[col][c] /= pivot;
    }
    rhs[col] /= pivot;

    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = matrix[row][col];
      if (factor === 0) continue;
      for (let c = col; c < n; c += 1) {
        matrix[row][c] -= factor * matrix[col][c];
      }
      rhs[row] -= factor * rhs[col];
    }
  }

  const [h0, h1, h2, h3, h4, h5, h6, h7] = rhs;
  const f = (v: number) => (Math.abs(v) < 1e-10 ? '0' : v.toFixed(8));
  return `matrix3d(${f(h0)},${f(h3)},0,${f(h6)},${f(h1)},${f(h4)},0,${f(h7)},0,0,1,0,${f(h2)},${f(h5)},0,1)`;
}

interface EmbeddedPhotoScreenProps {
  placement: EmbeddedScreenPlacement;
  isCapturing: boolean;
  customUrl: string | null;
  reloadNonce: number;
  override?: FrameOverride;
  isSelected: boolean;
  onSelectFrame: (frameIndex: number) => void;
  onAssignAssetId: (frameIndex: number, assetId: string) => void;
  onDropFilesOnFrame: (frameIndex: number, files: File[], rejectedCount: number) => void;
  onToggleOverrideFit: (frameIndex: number) => void;
  onClearOverride: (frameIndex: number) => void;
  onOpenAssetTray: () => void;
}

const EmbeddedPhotoScreen: React.FC<EmbeddedPhotoScreenProps> = React.memo(
  ({
    placement,
    isCapturing,
    customUrl,
    reloadNonce,
    override,
    isSelected,
    onSelectFrame,
    onAssignAssetId,
    onDropFilesOnFrame,
    onToggleOverrideFit,
    onClearOverride,
    onOpenAssetTray,
  }) => {
    const frameIndex = placement.frame;
    const effectiveIframeSrc = !override && customUrl ? customUrl : null;
    const {
      iframeLoading,
      iframeBlocked,
      localReload,
      handleIframeLoad,
      handleIframeError,
      triggerLocalReload,
    } = useIframeStatus(effectiveIframeSrc, reloadNonce);
    const iframeKey = `${effectiveIframeSrc ?? 'none'}-${reloadNonce}-${localReload}`;

    const matrixTransform = useMemo(
      () =>
        computePerspectiveMatrix3d(
          EMBEDDED_SCREEN_WIDTH,
          EMBEDDED_SCREEN_HEIGHT,
          placement.corners
        ),
      [placement.corners]
    );

    const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useFrameDropZone({
      frameIndex,
      selectOnDrop: true,
      onSelectFrame,
      onAssignAssetId,
      onDropFilesOnFrame,
    });

    const handleSurfaceClick = useCallback(() => {
      onSelectFrame(frameIndex);
      if (!override && !effectiveIframeSrc) {
        onOpenAssetTray();
      }
    }, [effectiveIframeSrc, frameIndex, onOpenAssetTray, onSelectFrame, override]);

    return (
      <div
        onClick={handleSurfaceClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label={`Live Action smartphone screen ${frameIndex}`}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: `${EMBEDDED_SCREEN_WIDTH}px`,
          height: `${EMBEDDED_SCREEN_HEIGHT}px`,
          transformOrigin: '0 0',
          transform: matrixTransform,
          borderRadius: `${placement.borderRadiusPx}px`,
        }}
        className={`group overflow-hidden cursor-pointer select-none ${
          override ? 'bg-black' : 'bg-[#f4f3f0]'
        } ${
          isDragOver && !isCapturing
            ? 'ring-[4px] ring-emerald-400/90'
            : isSelected && !isCapturing && !override && !effectiveIframeSrc
              ? 'ring-2 ring-neutral-900/20'
              : ''
        }`}
      >
        {/* 1. Custom uploaded image override */}
        {override && (
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <img
              src={override.objectUrl}
              alt={override.name}
              width={EMBEDDED_SCREEN_WIDTH}
              height={EMBEDDED_SCREEN_HEIGHT}
              decoding="async"
              draggable={false}
              className={`w-full h-full select-none ${
                override.fit === 'cover' ? 'object-cover' : 'object-contain'
              }`}
            />

            {!isCapturing && (
              <div
                className={`absolute top-6 right-4 z-30 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 ${
                  isSelected ? '[@media(hover:none)]:opacity-100' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleOverrideFit(frameIndex);
                  }}
                  title={
                    override.fit === 'cover'
                      ? 'Switch image to Fit (contain)'
                      : 'Switch image to Fill (cover)'
                  }
                  aria-label={
                    override.fit === 'cover'
                      ? `Fit image in screen ${frameIndex}`
                      : `Fill image in screen ${frameIndex}`
                  }
                  className="inline-flex items-center gap-1.5 min-h-[44px] h-11 px-3.5 rounded-full bg-black/75 hover:bg-black/90 text-white border border-white/15 backdrop-blur-md text-xs font-medium transition-colors studio-focus-ring"
                >
                  {override.fit === 'cover' ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Fit</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>Fill</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearOverride(frameIndex);
                  }}
                  title="Remove custom image"
                  aria-label={`Remove custom image from screen ${frameIndex}`}
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-black/75 hover:bg-red-600/90 text-white border border-white/15 backdrop-blur-md transition-colors studio-focus-ring"
                >
                  <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Live external URL preview */}
        {!override && effectiveIframeSrc && (
          <div className="relative w-full h-full bg-white">
            <iframe
              key={iframeKey}
              src={effectiveIframeSrc}
              title={`Live URL preview in screen ${frameIndex}`}
              width={EMBEDDED_SCREEN_WIDTH}
              height={EMBEDDED_SCREEN_HEIGHT}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
              referrerPolicy="no-referrer"
              className="w-full h-full border-0 block bg-white"
            />

            {iframeLoading && !isCapturing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-neutral-950/70 backdrop-blur-sm text-white">
                <Loader2 className="w-5 h-5 shrink-0 animate-spin text-white/80" aria-hidden="true" />
                <span className="text-xs font-medium tracking-tight text-white/90">
                  Loading preview...
                </span>
              </div>
            )}

            {iframeBlocked && !isCapturing && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-neutral-950/88 backdrop-blur-md px-6 text-center text-white">
                <p className="text-sm font-semibold tracking-tight">Preview blocked by site</p>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-[240px]">
                  This site may prevent embedding with X-Frame-Options or CSP headers.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerLocalReload();
                    }}
                    className="inline-flex items-center gap-1.5 min-h-[44px] h-11 px-4 rounded-full bg-white/12 hover:bg-white/20 text-xs font-medium text-white transition-colors studio-focus-ring"
                  >
                    <RotateCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                  <a
                    href={effectiveIframeSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 min-h-[44px] h-11 px-4 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-semibold transition-colors studio-focus-ring"
                  >
                    <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Open Tab</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Clean neutral blank screen state */}
        {!override && !effectiveIframeSrc && (
          <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
            {!isCapturing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFrame(frameIndex);
                  onOpenAssetTray();
                }}
                className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl text-neutral-500 hover:text-neutral-800 transition-colors studio-focus-ring"
              >
                <div className="w-12 h-12 rounded-2xl border border-neutral-900/12 bg-white/80 flex items-center justify-center shadow-sm">
                  <ImagePlus className="w-5 h-5 shrink-0" aria-hidden="true" />
                </div>
                <span className="text-xs font-semibold tracking-tight text-neutral-700">
                  Drop screen image
                </span>
                <span className="text-[11px] text-neutral-500 leading-snug">
                  Click to open Assets or paste a live URL
                </span>
              </button>
            )}
          </div>
        )}

        {/* Drag-over highlight */}
        {isDragOver && !isCapturing && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[2px]">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-950/90 text-white border border-emerald-400/50 shadow-xl">
              <ImagePlus className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-tight">
                Drop on Frame {frameIndex}
              </span>
            </div>
          </div>
        )}

        {/* Subtle realistic glass reflection & ambient bezel vignette */}
        <div
          aria-hidden="true"
          style={{
            background: placement.glassGlareGradient,
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.24), inset 0 1px 6px rgba(0, 0, 0, 0.14)',
            borderRadius: `${placement.borderRadiusPx}px`,
          }}
          className="pointer-events-none absolute inset-0 z-10"
        />
      </div>
    );
  }
);

EmbeddedPhotoScreen.displayName = 'EmbeddedPhotoScreen';

interface LiveActionStageProps {
  scene: LiveActionSceneId;
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

export const LiveActionStage: React.FC<LiveActionStageProps> = React.memo(
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
    const [imageError, setImageError] = useState(false);
    const config = LIVE_ACTION_CONFIGS[scene];

    useEffect(() => {
      setImageError(false);
    }, [scene]);

    return (
      <div
        style={{
          width: `${LIVE_ACTION_CANVAS_WIDTH}px`,
          height: `${LIVE_ACTION_CANVAS_HEIGHT}px`,
          background: config.fallbackGradient,
        }}
        className={`relative shrink-0 overflow-hidden select-none transition-[border-radius,box-shadow] duration-200 ${
          isCapturing
            ? 'rounded-none shadow-none'
            : 'rounded-[28px] shadow-[0_32px_90px_rgba(0,0,0,0.34)] ring-1 ring-black/10'
        }`}
      >
        {/* Photorealistic neutral-toned studio plate */}
        {!imageError && (
          <img
            src={config.imageUrl}
            alt={config.alt}
            width={LIVE_ACTION_CANVAS_WIDTH}
            height={LIVE_ACTION_CANVAS_HEIGHT}
            decoding="async"
            referrerPolicy="no-referrer"
            draggable={false}
            onError={() => setImageError(true)}
            style={config.imageFilter ? { filter: config.imageFilter } : undefined}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />
        )}

        {/* Mode A: Perspective-mapped live screens inside photographed hand-held smartphones */}
        {config.embeddedScreens?.map((placement) => (
          <EmbeddedPhotoScreen
            key={`${scene}-embedded-${placement.frame}`}
            placement={placement}
            isCapturing={isCapturing}
            customUrl={customUrl}
            reloadNonce={reloadNonce}
            override={frameOverrides[placement.frame]}
            isSelected={selectedFrameIndex === placement.frame}
            onSelectFrame={onSelectFrame}
            onAssignAssetId={onAssignAssetId}
            onDropFilesOnFrame={onDropFilesOnFrame}
            onToggleOverrideFit={onToggleOverrideFit}
            onClearOverride={onClearOverride}
            onOpenAssetTray={onOpenAssetTray}
          />
        ))}

        {/* Mode B: Grounded photorealistic smartphone mockups composed onto studio backdrops */}
        {config.composedPhones?.map((placement) => (
          <div
            key={`${scene}-composed-${placement.frame}`}
            style={{
              position: 'absolute',
              left: `${placement.leftPct}%`,
              top: `${placement.topPct}%`,
              transform: `translate(-50%, -50%) scale(${placement.scale}) rotate(${placement.rotateDeg}deg)`,
              filter: placement.shadowFilter,
            }}
            className="origin-center"
          >
            <SmartphoneMockup
              frameIndex={placement.frame}
              showBezel={showBezel}
              bezelFinish={bezelFinish}
              backgroundTone={backgroundTone}
              isTransparentBackdrop={isTransparentBackdrop}
              isCapturing={isCapturing}
              customUrl={customUrl}
              reloadNonce={reloadNonce}
              override={frameOverrides[placement.frame]}
              isSelected={selectedFrameIndex === placement.frame}
              onSelectFrame={onSelectFrame}
              onAssignAssetId={onAssignAssetId}
              onDropFilesOnFrame={onDropFilesOnFrame}
              onToggleOverrideFit={onToggleOverrideFit}
              onClearOverride={onClearOverride}
              onOpenAssetTray={onOpenAssetTray}
            />
          </div>
        ))}
      </div>
    );
  }
);

LiveActionStage.displayName = 'LiveActionStage';
