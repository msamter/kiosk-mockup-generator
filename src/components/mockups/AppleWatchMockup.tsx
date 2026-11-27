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

interface AppleWatchMockupProps {
  frameIndex: number;
  screenWidthPx: number;
  screenHeightPx: number;
  screenRadiusPx: number;
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

interface AppleWatchHardwarePalette {
  strapGradient: string;
  strapEdgeHighlight: string;
  crownGradient: string;
  crownKnurl: string;
  lugSlotBg: string;
  lugShadow: string;
}

const APPLE_WATCH_PALETTES: Record<BezelFinishId, AppleWatchHardwarePalette> = {
  black: {
    strapGradient:
      'linear-gradient(90deg, #111115 0%, #222227 20%, #2a2a30 50%, #202025 80%, #101014 100%)',
    strapEdgeHighlight: 'rgba(255, 255, 255, 0.08)',
    crownGradient:
      'linear-gradient(180deg, #323238 0%, #1e1e23 32%, #111114 70%, #27272d 100%)',
    crownKnurl:
      'repeating-linear-gradient(180deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1.5px, transparent 1.5px, transparent 4.5px)',
    lugSlotBg: '#09090b',
    lugShadow: 'rgba(0, 0, 0, 0.58)',
  },
  grey: {
    strapGradient:
      'linear-gradient(90deg, #3b3d42 0%, #55575e 20%, #61636b 50%, #51535a 80%, #393b40 100%)',
    strapEdgeHighlight: 'rgba(255, 255, 255, 0.16)',
    crownGradient:
      'linear-gradient(180deg, #8b8d94 0%, #686a70 32%, #4c4e53 70%, #787a81 100%)',
    crownKnurl:
      'repeating-linear-gradient(180deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 1.5px, transparent 1.5px, transparent 4.5px)',
    lugSlotBg: '#2b2c30',
    lugShadow: 'rgba(0, 0, 0, 0.45)',
  },
  silver: {
    strapGradient:
      'linear-gradient(90deg, #b5b7bd 0%, #d4d6dc 20%, #e3e5eb 50%, #cfd1d7 80%, #adb0b6 100%)',
    strapEdgeHighlight: 'rgba(255, 255, 255, 0.56)',
    crownGradient:
      'linear-gradient(180deg, #f3f5f9 0%, #d5d7dd 32%, #b0b2b9 70%, #e5e7ed 100%)',
    crownKnurl:
      'repeating-linear-gradient(180deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1.5px, transparent 1.5px, transparent 4.5px)',
    lugSlotBg: '#8e9097',
    lugShadow: 'rgba(0, 0, 0, 0.34)',
  },
};

export const AppleWatchMockup: React.FC<AppleWatchMockupProps> = React.memo(
  ({
    frameIndex,
    screenWidthPx,
    screenHeightPx,
    screenRadiusPx,
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
    const hardware = APPLE_WATCH_PALETTES[bezelFinish];
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
    const iframeKey = `apple-watch-${frameIndex}-${screenWidthPx}x${screenHeightPx}-${effectiveIframeSrc ?? 'none'}-${reloadNonce}-${localReload}`;

    const { isDragOver, handleDragOver, handleDragLeave, handleDrop } = useFrameDropZone({
      frameIndex,
      onAssignAssetId,
      onDropFilesOnFrame,
    });

    const innerGlassRadiusPx = screenRadiusPx + bezelPadPx;
    const outerCaseRadiusPx = innerGlassRadiusPx + 5;
    const framelessRadiusPx = screenRadiusPx + 4;
    const activeScreenRadiusPx = showBezel ? screenRadiusPx : framelessRadiusPx;

    const screenContent = (
      <div
        onClick={() => onSelectFrame(frameIndex)}
        style={{
          width: `${screenWidthPx}px`,
          height: `${screenHeightPx}px`,
          borderRadius: `${activeScreenRadiusPx}px`,
          colorScheme: 'dark',
          contain: 'layout style paint',
        }}
        className="relative overflow-hidden bg-[#070709] select-none"
      >
        {override ? (
          <>
            <img
              src={override.objectUrl}
              alt={override.name}
              width={screenWidthPx}
              height={screenHeightPx}
              decoding="async"
              draggable={false}
              className={`w-full h-full ${
                override.fit === 'contain' ? 'object-contain bg-[#070709]' : 'object-cover'
              }`}
            />

            {!isCapturing && (
              <div
                className={`absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 opacity-0 group-hover/watch:opacity-100 focus-within:opacity-100 transition-opacity duration-150 ${
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
                  title={override.fit === 'cover' ? 'Fit entire image' : 'Fill watch display'}
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
                  aria-label={`Clear Apple Watch frame ${frameIndex}`}
                  title="Clear watch display"
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
              title={`Apple Watch preview frame ${frameIndex}`}
              width={screenWidthPx}
              height={screenHeightPx}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              referrerPolicy="no-referrer"
              style={{
                width: `${screenWidthPx}px`,
                height: `${screenHeightPx}px`,
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
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 px-8 text-center bg-[#070709]/94 text-neutral-200">
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
          <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center bg-[radial-gradient(ellipse_at_50%_38%,#17171c_0%,#0b0b0e_66%,#060608_100%)]">
            {!isCapturing && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectFrame(frameIndex);
                  onOpenAssetTray();
                }}
                className="group/empty flex flex-col items-center gap-2.5 px-5 py-5 rounded-3xl border border-dashed border-white/12 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/24 transition-colors studio-focus-ring"
              >
                <span className="w-9 h-9 rounded-2xl bg-white/[0.06] border border-white/10 inline-flex items-center justify-center text-neutral-300 group-hover/empty:text-white transition-colors">
                  <ImagePlus className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-neutral-200">
                    Watch <span className="font-mono-tabular">{frameIndex}</span>
                  </p>
                  <p className="text-[11px] leading-snug text-neutral-500 max-w-[155px]">
                    Drop image, upload, or paste URL
                  </p>
                </div>
              </button>
            )}
          </div>
        )}

        {!isCapturing && isDragOver && (
          <div className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] border-2 border-white/85 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-2 rounded-xl bg-white text-neutral-950 text-xs font-semibold shadow-lg">
              Drop into Watch {frameIndex}
            </span>
          </div>
        )}
      </div>
    );

    // Frameless squircle Apple Watch display when Bezel is OFF
    if (!showBezel) {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            borderRadius: `${framelessRadiusPx}px`,
            boxShadow: deviceShadow || undefined,
          }}
          className={`group/watch relative shrink-0 transition-shadow duration-200 ${
            !isCapturing && isSelected
              ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-transparent'
              : ''
          }`}
        >
          {screenContent}
        </div>
      );
    }

    const caseWidthPx = screenWidthPx + bezelPadPx * 2 + 12;
    const caseHeightPx = screenHeightPx + bezelPadPx * 2 + 12;
    const strapWidthPx = Math.round(caseWidthPx * 0.56);
    const lugWidthPx = Math.round(caseWidthPx * 0.62);
    const strapOverlapPx = 18;
    const crownWidthPx = Math.max(12, Math.round(caseWidthPx * 0.036));
    const crownHeightPx = Math.max(58, Math.round(caseHeightPx * 0.165));
    const sideBtnWidthPx = Math.max(5, Math.round(caseWidthPx * 0.015));
    const sideBtnHeightPx = Math.max(74, Math.round(caseHeightPx * 0.21));

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="group/watch relative flex flex-col items-center shrink-0"
      >
        {/* Top Apple Watch Sport Band + recessed lug slot */}
        {showStraps && strapLengthPx > 0 && (
          <div className="relative z-0 flex flex-col items-center" aria-hidden="true">
            <div
              style={{
                width: `${strapWidthPx}px`,
                height: `${strapLengthPx}px`,
                marginBottom: `-${strapOverlapPx}px`,
                background: hardware.strapGradient,
                boxShadow: `inset 1px 0 0 ${hardware.strapEdgeHighlight}, inset -1px 0 0 ${hardware.strapEdgeHighlight}, inset 0 -18px 20px -6px ${hardware.lugShadow}`,
                clipPath: 'polygon(4% 0%, 96% 0%, 100% 100%, 0% 100%)',
              }}
              className="rounded-t-[24px]"
            />
            <span
              style={{
                width: `${lugWidthPx}px`,
                background: hardware.lugSlotBg,
              }}
              className="relative z-[1] h-[6px] mb-[12px] rounded-full opacity-85"
            />
          </div>
        )}

        {/* Sculpted squircle Apple Watch case + Digital Crown + Side Button */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Signature upper-right Digital Crown */}
          <div
            aria-hidden="true"
            style={{
              width: `${crownWidthPx}px`,
              height: `${crownHeightPx}px`,
              right: `-${crownWidthPx - 2}px`,
              top: `${Math.round(caseHeightPx * 0.24)}px`,
              background: hardware.crownGradient,
              boxShadow: `inset -1px 0 0 ${finish.buttonHighlight}, 0 4px 10px rgba(0, 0, 0, 0.35)`,
            }}
            className="pointer-events-none absolute rounded-r-[7px] overflow-hidden"
          >
            <span
              style={{ background: hardware.crownKnurl }}
              className="block w-full h-full opacity-85"
            />
          </div>

          {/* Flush right-side pill Action / Side Button */}
          <span
            aria-hidden="true"
            style={{
              width: `${sideBtnWidthPx}px`,
              height: `${sideBtnHeightPx}px`,
              right: `-${sideBtnWidthPx - 1}px`,
              top: `${Math.round(caseHeightPx * 0.51)}px`,
              background: finish.buttonColor,
              boxShadow: `inset -1px 0 0 ${finish.buttonHighlight}, 0 2px 6px rgba(0, 0, 0, 0.3)`,
            }}
            className="pointer-events-none absolute rounded-r-[4px]"
          />

          {/* Outer sculpted metallic squircle chassis */}
          <div
            style={{
              background: finish.chassisGradient,
              boxShadow: deviceShadow || undefined,
              borderRadius: `${outerCaseRadiusPx}px`,
              padding: '6px',
            }}
            className={`relative transition-shadow duration-200 ${
              !isCapturing && isSelected
                ? 'ring-2 ring-white/45 ring-offset-2 ring-offset-transparent'
                : ''
            }`}
          >
            {/* Edge-to-edge curved black glass bezel */}
            <div
              style={{
                padding: `${bezelPadPx}px`,
                borderRadius: `${innerGlassRadiusPx}px`,
                boxShadow: `inset 0 0 0 1px ${finish.rimHighlight}, inset 0 2px 10px rgba(255, 255, 255, 0.12), inset 0 -4px 12px rgba(0, 0, 0, 0.65)`,
              }}
              className="relative bg-[#050507]"
            >
              {/* Subtle curved Ion-X glass rim highlight */}
              <span
                aria-hidden="true"
                style={{
                  borderRadius: `${Math.max(12, innerGlassRadiusPx - 2)}px`,
                  background:
                    'linear-gradient(142deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 24%, transparent 44%)',
                }}
                className="pointer-events-none absolute inset-[2px]"
              />

              {screenContent}
            </div>
          </div>
        </div>

        {/* Bottom Apple Watch Sport Band + metallic pin */}
        {showStraps && strapLengthPx > 0 && (
          <div className="relative z-0 flex flex-col items-center" aria-hidden="true">
            <span
              style={{
                width: `${lugWidthPx}px`,
                background: hardware.lugSlotBg,
              }}
              className="relative z-[1] h-[6px] mt-[12px] rounded-full opacity-85"
            />
            <div
              style={{
                width: `${strapWidthPx}px`,
                height: `${strapLengthPx}px`,
                marginTop: `-${strapOverlapPx}px`,
                background: hardware.strapGradient,
                boxShadow: `inset 1px 0 0 ${hardware.strapEdgeHighlight}, inset -1px 0 0 ${hardware.strapEdgeHighlight}, inset 0 18px 20px -6px ${hardware.lugShadow}`,
                clipPath: 'polygon(0% 0%, 100% 0%, 96% 100%, 4% 100%)',
              }}
              className="relative rounded-b-[24px]"
            >
              {/* Signature metallic pin-and-tuck stud */}
              <span
                style={{
                  background: finish.chassisGradient,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.45)',
                }}
                className="absolute bottom-[26px] left-1/2 -translate-x-1/2 w-[11px] h-[11px] rounded-full opacity-85"
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

AppleWatchMockup.displayName = 'AppleWatchMockup';
