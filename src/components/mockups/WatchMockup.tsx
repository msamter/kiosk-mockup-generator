import React, { useMemo } from 'react';
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCw,
  X,
} from 'lucide-react';
import { useFrameDropZone } from '../../hooks/useFrameDropZone';
import { useIframeStatus } from '../../hooks/useIframeStatus';
import { FrameOverride } from '../../types/assets';
import {
  BEZEL_FINISHES,
  BezelFinishId,
  getAdaptiveDeviceShadow,
} from '../../types/studio';

interface WatchMockupProps {
  frameIndex: number;
  screenDiameterPx: number;
  bezelPadPx: number;
  showStraps: boolean;
  strapLengthPx: number;
  showBezel: boolean;
  bezelFinish: BezelFinishId;
  backgroundTone: number;
  isTransparentBackdrop: boolean;
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

interface WatchHardwarePalette {
  strapTopGradient: string;
  strapBottomGradient: string;
  strapEdgeHighlight: string;
  crownGradient: string;
  crownKnurl: string;
  lugShadow: string;
}

const WATCH_HARDWARE_PALETTES: Record<BezelFinishId, WatchHardwarePalette> = {
  black: {
    strapTopGradient:
      'linear-gradient(90deg, #121216 0%, #232328 24%, #29292f 50%, #202026 76%, #111115 100%)',
    strapBottomGradient:
      'linear-gradient(90deg, #121216 0%, #232328 24%, #29292f 50%, #202026 76%, #111115 100%)',
    strapEdgeHighlight: 'rgba(255, 255, 255, 0.08)',
    crownGradient:
      'linear-gradient(180deg, #2e2e34 0%, #1c1c21 30%, #101013 70%, #25252b 100%)',
    crownKnurl:
      'repeating-linear-gradient(180deg, rgba(255,255,255,0.16) 0px, rgba(255,255,255,0.16) 1.5px, transparent 1.5px, transparent 5px)',
    lugShadow: 'rgba(0, 0, 0, 0.55)',
  },
  grey: {
    strapTopGradient:
      'linear-gradient(90deg, #3d3f44 0%, #56585f 24%, #61636b 50%, #52545b 76%, #3a3c41 100%)',
    strapBottomGradient:
      'linear-gradient(90deg, #3d3f44 0%, #56585f 24%, #61636b 50%, #52545b 76%, #3a3c41 100%)',
    strapEdgeHighlight: 'rgba(255, 255, 255, 0.16)',
    crownGradient:
      'linear-gradient(180deg, #878990 0%, #66686e 32%, #4a4c51 70%, #75777e 100%)',
    crownKnurl:
      'repeating-linear-gradient(180deg, rgba(255,255,255,0.24) 0px, rgba(255,255,255,0.24) 1.5px, transparent 1.5px, transparent 5px)',
    lugShadow: 'rgba(0, 0, 0, 0.44)',
  },
  silver: {
    strapTopGradient:
      'linear-gradient(90deg, #b5b7bd 0%, #d5d7dd 24%, #e2e4ea 50%, #cfd1d7 76%, #adb0b6 100%)',
    strapBottomGradient:
      'linear-gradient(90deg, #b5b7bd 0%, #d5d7dd 24%, #e2e4ea 50%, #cfd1d7 76%, #adb0b6 100%)',
    strapEdgeHighlight: 'rgba(255, 255, 255, 0.55)',
    crownGradient:
      'linear-gradient(180deg, #f1f3f7 0%, #d4d6dc 32%, #aeb0b7 70%, #e4e6ec 100%)',
    crownKnurl:
      'repeating-linear-gradient(180deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1.5px, transparent 1.5px, transparent 5px)',
    lugShadow: 'rgba(0, 0, 0, 0.34)',
  },
};

export const WatchMockup: React.FC<WatchMockupProps> = React.memo(
  ({
    frameIndex,
    screenDiameterPx,
    bezelPadPx,
    showStraps,
    strapLengthPx,
    showBezel,
    bezelFinish,
    backgroundTone,
    isTransparentBackdrop,
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
    const finish = BEZEL_FINISHES[bezelFinish];
    const hardware = WATCH_HARDWARE_PALETTES[bezelFinish];
    const suppressShadow = isTransparentBackdrop && isCapturing;

    const deviceShadow = useMemo(
      () =>
        getAdaptiveDeviceShadow(
          backgroundTone,
          bezelFinish,
          showBezel ? 'phone' : 'window',
          suppressShadow
        ),
      [backgroundTone, bezelFinish, showBezel, suppressShadow]
    );

    const effectiveIframeSrc = !override && customUrl ? customUrl : null;
    const {
      iframeLoading,
      iframeBlocked,
      localReload,
      handleIframeLoad,
      handleIframeError,
      triggerLocalReload,
    } = useIframeStatus(effectiveIframeSrc, reloadNonce);
    const iframeKey = `watch-${frameIndex}-${screenDiameterPx}-${effectiveIframeSrc ?? 'none'}-${reloadNonce}-${localReload}`;

    const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useFrameDropZone({
      frameIndex,
      onAssignAssetId,
      onDropFilesOnFrame,
    });

    const screenContent = (
      <div
        onClick={() => onSelectFrame(frameIndex)}
        style={{
          width: `${screenDiameterPx}px`,
          height: `${screenDiameterPx}px`,
          colorScheme: 'dark',
          contain: 'layout style paint',
        }}
        className="relative rounded-full overflow-hidden bg-[#070709] select-none"
      >
        {override ? (
          <>
            <img
              src={override.objectUrl}
              alt={override.name}
              width={screenDiameterPx}
              height={screenDiameterPx}
              decoding="async"
              draggable={false}
              className={`w-full h-full ${
                override.fit === 'contain' ? 'object-contain bg-[#070709]' : 'object-cover'
              }`}
            />

            {!isCapturing && (
              <div
                className={`absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 opacity-0 group-hover/watch:opacity-100 focus-within:opacity-100 transition-opacity duration-150 ${
                  isSelected ? '[@media(hover:none)]:opacity-100' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleOverrideFit(frameIndex);
                  }}
                  aria-label={
                    override.fit === 'cover'
                      ? 'Switch image to fit inside watch'
                      : 'Switch image to fill watch'
                  }
                  title={override.fit === 'cover' ? 'Fit entire image' : 'Fill watch face'}
                  className="relative before:content-[''] before:absolute before:-inset-1.5 w-9 h-9 rounded-full bg-black/78 text-white border border-white/15 backdrop-blur-md inline-flex items-center justify-center hover:bg-black/92 transition-colors studio-focus-ring"
                >
                  {override.fit === 'cover' ? (
                    <Minimize2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onClearOverride(frameIndex);
                  }}
                  aria-label={`Clear watch frame ${frameIndex}`}
                  title="Clear watch face"
                  className="relative before:content-[''] before:absolute before:-inset-1.5 w-9 h-9 rounded-full bg-black/78 text-white border border-white/15 backdrop-blur-md inline-flex items-center justify-center hover:bg-black/92 transition-colors studio-focus-ring"
                >
                  <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        ) : effectiveIframeSrc ? (
          <>
            <iframe
              key={iframeKey}
              src={effectiveIframeSrc}
              title={`Pixel Watch preview frame ${frameIndex}`}
              width={screenDiameterPx}
              height={screenDiameterPx}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              referrerPolicy="no-referrer"
              style={{
                width: `${screenDiameterPx}px`,
                height: `${screenDiameterPx}px`,
                colorScheme: 'dark',
              }}
              className="border-0 bg-[#070709] block"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />

            {!isCapturing && iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#070709]/88 backdrop-blur-sm text-neutral-300">
                <Loader2 className="w-5 h-5 shrink-0 animate-spin text-neutral-400" aria-hidden="true" />
                <span className="text-xs font-medium">Loading…</span>
              </div>
            )}

            {!isCapturing && iframeBlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 px-12 text-center bg-[#070709]/94 text-neutral-200">
                <p className="text-xs font-semibold text-white">Preview blocked</p>
                <p className="text-[11px] leading-relaxed text-neutral-300">
                  This site restricts frame embedding.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      triggerLocalReload();
                    }}
                    className="relative before:content-[''] before:absolute before:-inset-y-2 before:-inset-x-1 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white/10 hover:bg-white/16 border border-white/14 text-[11px] font-medium text-white transition-colors studio-focus-ring"
                  >
                    <RotateCw className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                  <a
                    href={effectiveIframeSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="relative before:content-[''] before:absolute before:-inset-y-2 before:-inset-x-1 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 text-[11px] font-semibold transition-colors studio-focus-ring"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center px-10 text-center bg-[radial-gradient(circle_at_50%_40%,#17171c_0%,#0b0b0e_66%,#060608_100%)]">
            {!isCapturing && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectFrame(frameIndex);
                  onOpenAssetTray();
                }}
                className="group/empty flex flex-col items-center gap-2.5 px-6 py-5 rounded-full border border-dashed border-white/12 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/24 transition-colors studio-focus-ring"
              >
                <span className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 inline-flex items-center justify-center text-neutral-300 group-hover/empty:text-white transition-colors">
                  <ImagePlus className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-neutral-200">
                    Watch <span className="font-mono-tabular">{frameIndex}</span>
                  </p>
                  <p className="text-[11px] leading-snug text-neutral-500 max-w-[150px]">
                    Drop image, upload, or paste URL
                  </p>
                </div>
              </button>
            )}
          </div>
        )}

        {!isCapturing && isDragOver && (
          <div className="pointer-events-none absolute inset-0 z-40 rounded-full border-2 border-white/85 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-2 rounded-full bg-white text-neutral-950 text-xs font-semibold shadow-lg">
              Drop into Watch {frameIndex}
            </span>
          </div>
        )}
      </div>
    );

    // Frameless pure circular watch display when Bezel is OFF
    if (!showBezel) {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            boxShadow: deviceShadow || undefined,
          }}
          className={`group/watch relative rounded-full shrink-0 transition-shadow duration-200 ${
            !isCapturing && isSelected
              ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-transparent'
              : ''
          }`}
        >
          {screenContent}
        </div>
      );
    }

    const caseDiameterPx = screenDiameterPx + bezelPadPx * 2 + 10;
    const strapWidthPx = Math.round(caseDiameterPx * 0.44);
    const strapOverlapPx = 28;
    const crownWidthPx = Math.max(12, Math.round(caseDiameterPx * 0.032));
    const crownHeightPx = Math.max(44, Math.round(caseDiameterPx * 0.12));
    const sideBtnWidthPx = Math.max(10, Math.round(caseDiameterPx * 0.024));
    const sideBtnHeightPx = Math.max(30, Math.round(caseDiameterPx * 0.085));

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="group/watch relative flex flex-col items-center shrink-0"
      >
        {/* Top seamless lugless Active Band */}
        {showStraps && strapLengthPx > 0 && (
          <div
            aria-hidden="true"
            style={{
              width: `${strapWidthPx}px`,
              height: `${strapLengthPx}px`,
              marginBottom: `-${strapOverlapPx}px`,
              background: hardware.strapTopGradient,
              boxShadow: `inset 1px 0 0 ${hardware.strapEdgeHighlight}, inset -1px 0 0 ${hardware.strapEdgeHighlight}, inset 0 -18px 22px -6px ${hardware.lugShadow}`,
              clipPath: 'polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)',
            }}
            className="relative z-0 rounded-t-[26px]"
          >
            <span
              style={{ background: hardware.strapEdgeHighlight }}
              className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[56%] h-[2px] rounded-full opacity-50"
            />
          </div>
        )}

        {/* Circular domed Pixel Watch body + side hardware */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Flush 2 o'clock side button following circular contour */}
          <span
            aria-hidden="true"
            style={{
              width: `${sideBtnWidthPx}px`,
              height: `${sideBtnHeightPx}px`,
              right: `${Math.round(caseDiameterPx * 0.056)}px`,
              top: `${Math.round(caseDiameterPx * 0.2)}px`,
              background: finish.buttonColor,
              boxShadow: `inset -1px 0 0 ${finish.buttonHighlight}`,
              transform: 'rotate(-28deg)',
            }}
            className="pointer-events-none absolute rounded-r-[4px]"
          />

          {/* Signature 3 o'clock haptic rotating crown */}
          <div
            aria-hidden="true"
            style={{
              width: `${crownWidthPx}px`,
              height: `${crownHeightPx}px`,
              right: `-${crownWidthPx - 2}px`,
              background: hardware.crownGradient,
              boxShadow: `inset -1px 0 0 ${finish.buttonHighlight}, 0 4px 10px rgba(0, 0, 0, 0.35)`,
            }}
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-r-[7px] overflow-hidden"
          >
            <span
              style={{ background: hardware.crownKnurl }}
              className="block w-full h-full opacity-80"
            />
          </div>

          {/* Outer polished circular metallic pebble chassis */}
          <div
            style={{
              background: finish.chassisGradient,
              boxShadow: deviceShadow || undefined,
              padding: '5px',
            }}
            className={`relative rounded-full transition-shadow duration-200 ${
              !isCapturing && isSelected
                ? 'ring-2 ring-white/45 ring-offset-2 ring-offset-transparent'
                : ''
            }`}
          >
            {/* Domed 3D obsidian glass bezel surround */}
            <div
              style={{
                padding: `${bezelPadPx}px`,
                boxShadow: `inset 0 0 0 1px ${finish.rimHighlight}, inset 0 2px 10px rgba(255, 255, 255, 0.12), inset 0 -4px 12px rgba(0, 0, 0, 0.65)`,
              }}
              className="relative rounded-full bg-[#050507]"
            >
              {/* Subtle domed glass specular arc on bezel rim */}
              <span
                aria-hidden="true"
                style={{
                  background:
                    'linear-gradient(140deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 26%, transparent 48%)',
                }}
                className="pointer-events-none absolute inset-[2px] rounded-full"
              />

              {screenContent}
            </div>
          </div>
        </div>

        {/* Bottom seamless lugless Active Band */}
        {showStraps && strapLengthPx > 0 && (
          <div
            aria-hidden="true"
            style={{
              width: `${strapWidthPx}px`,
              height: `${strapLengthPx}px`,
              marginTop: `-${strapOverlapPx}px`,
              background: hardware.strapBottomGradient,
              boxShadow: `inset 1px 0 0 ${hardware.strapEdgeHighlight}, inset -1px 0 0 ${hardware.strapEdgeHighlight}, inset 0 18px 22px -6px ${hardware.lugShadow}`,
              clipPath: 'polygon(0% 0%, 100% 0%, 94% 100%, 6% 100%)',
            }}
            className="relative z-0 rounded-b-[26px]"
          >
            {/* Subtle strap adjustment tuck pin */}
            <span
              style={{
                background: finish.chassisGradient,
                boxShadow: '0 1px 3px rgba(0,0,0,0.45)',
              }}
              className="absolute bottom-[28px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full opacity-85"
            />
          </div>
        )}
      </div>
    );
  }
);

WatchMockup.displayName = 'WatchMockup';
