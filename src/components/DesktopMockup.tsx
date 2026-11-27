import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCw,
  X,
} from 'lucide-react';
import { FrameOverride } from '../types/assets';
import {
  BEZEL_FINISHES,
  BezelFinishId,
  getAdaptiveDeviceShadow,
  TERMINAL_SCENE_LAYOUTS,
  TerminalSceneId,
} from '../types/studio';
import { extractImageFilesFromDataTransfer } from '../utils/assetFiles';

interface DesktopMockupProps {
  formFactor: TerminalSceneId;
  frameIndex: number;
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

interface DesktopMetalPalette {
  neckGradient: string;
  baseGradient: string;
  baseEdge: string;
  lipGradient: string;
  scoopBg: string;
  chinBg: string;
  windowBarBg: string;
  windowBorder: string;
  windowAddressBg: string;
  windowAddressText: string;
}

const DESKTOP_METAL_PALETTES: Record<BezelFinishId, DesktopMetalPalette> = {
  black: {
    neckGradient:
      'linear-gradient(90deg, #121215 0%, #242429 22%, #2d2d33 50%, #1d1d22 78%, #101013 100%)',
    baseGradient:
      'linear-gradient(180deg, #2d2d33 0%, #1b1b20 48%, #111114 100%)',
    baseEdge: 'rgba(255, 255, 255, 0.14)',
    lipGradient:
      'linear-gradient(90deg, #161619 0%, #27272c 10%, #2f2f35 50%, #27272c 90%, #161619 100%)',
    scoopBg: 'linear-gradient(180deg, #0b0b0d 0%, #1a1a1f 100%)',
    chinBg: 'linear-gradient(180deg, #1d1d22 0%, #131317 100%)',
    windowBarBg: 'linear-gradient(180deg, #232327 0%, #1a1a1e 100%)',
    windowBorder: 'rgba(255, 255, 255, 0.12)',
    windowAddressBg: 'rgba(255, 255, 255, 0.06)',
    windowAddressText: 'rgba(255, 255, 255, 0.58)',
  },
  grey: {
    neckGradient:
      'linear-gradient(90deg, #4b4c51 0%, #6f7076 22%, #7d7f86 50%, #626369 78%, #47484d 100%)',
    baseGradient:
      'linear-gradient(180deg, #7f8188 0%, #606167 48%, #494a4f 100%)',
    baseEdge: 'rgba(255, 255, 255, 0.28)',
    lipGradient:
      'linear-gradient(90deg, #525359 0%, #73757b 10%, #83858c 50%, #73757b 90%, #525359 100%)',
    scoopBg: 'linear-gradient(180deg, #3c3d42 0%, #58595f 100%)',
    chinBg: 'linear-gradient(180deg, #696b71 0%, #54555b 100%)',
    windowBarBg: 'linear-gradient(180deg, #3b3c41 0%, #303136 100%)',
    windowBorder: 'rgba(255, 255, 255, 0.16)',
    windowAddressBg: 'rgba(0, 0, 0, 0.22)',
    windowAddressText: 'rgba(255, 255, 255, 0.72)',
  },
  silver: {
    neckGradient:
      'linear-gradient(90deg, #b0b2b8 0%, #dcdee3 22%, #eceef2 50%, #c8cad0 78%, #a6a8ae 100%)',
    baseGradient:
      'linear-gradient(180deg, #eef0f4 0%, #cfd1d7 48%, #b3b5bc 100%)',
    baseEdge: 'rgba(255, 255, 255, 0.78)',
    lipGradient:
      'linear-gradient(90deg, #b6b8be 0%, #dcdee3 10%, #edf0f4 50%, #dcdee3 90%, #b6b8be 100%)',
    scoopBg: 'linear-gradient(180deg, #989aa0 0%, #c4c6cc 100%)',
    chinBg: 'linear-gradient(180deg, #e0e2e7 0%, #c5c7cd 100%)',
    windowBarBg: 'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)',
    windowBorder: 'rgba(0, 0, 0, 0.12)',
    windowAddressBg: 'rgba(0, 0, 0, 0.06)',
    windowAddressText: 'rgba(23, 23, 27, 0.68)',
  },
};

const IFRAME_LOAD_TIMEOUT_MS = 8500;

function formatDisplayAddress(customUrl: string | null, override?: FrameOverride): string {
  if (override) return override.name;
  if (!customUrl) return 'studio.local';
  try {
    const parsed = new URL(customUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return customUrl;
  }
}

export const DesktopMockup: React.FC<DesktopMockupProps> = React.memo(
  ({
    formFactor,
    frameIndex,
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
    const [isDragOver, setIsDragOver] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [iframeBlocked, setIframeBlocked] = useState(false);
    const [localReload, setLocalReload] = useState(0);
    const loadTimeoutRef = useRef<number | null>(null);

    const spec = TERMINAL_SCENE_LAYOUTS[formFactor];
    const finish = BEZEL_FINISHES[bezelFinish];
    const metal = DESKTOP_METAL_PALETTES[bezelFinish];
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

    const groundShadowOpacity = useMemo(() => {
      if (suppressShadow) return 0;
      const t = Math.max(0, Math.min(100, backgroundTone)) / 100;
      return Number((0.62 - t * 0.34).toFixed(3));
    }, [backgroundTone, suppressShadow]);

    const effectiveIframeSrc = !override && customUrl ? customUrl : null;
    const iframeKey = `${formFactor}-${effectiveIframeSrc ?? 'none'}-${reloadNonce}-${localReload}`;

    useEffect(() => {
      if (loadTimeoutRef.current !== null) {
        window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      if (!effectiveIframeSrc) {
        setIframeLoading(false);
        setIframeBlocked(false);
        return;
      }

      setIframeLoading(true);
      setIframeBlocked(false);

      loadTimeoutRef.current = window.setTimeout(() => {
        loadTimeoutRef.current = null;
        setIframeLoading(false);
        setIframeBlocked(true);
      }, IFRAME_LOAD_TIMEOUT_MS);

      return () => {
        if (loadTimeoutRef.current !== null) {
          window.clearTimeout(loadTimeoutRef.current);
          loadTimeoutRef.current = null;
        }
      };
    }, [effectiveIframeSrc, reloadNonce, localReload]);

    const handleIframeLoad = useCallback(() => {
      if (loadTimeoutRef.current !== null) {
        window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
      setIframeLoading(false);
      setIframeBlocked(false);
    }, []);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        setIsDragOver(false);
      }
    }, []);

    const handleDrop = useCallback(
      async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);

        const assetId = event.dataTransfer.getData('application/x-studio-asset-id');
        if (assetId) {
          onAssignAssetId(frameIndex, assetId);
          return;
        }

        const { files, rejectedCount } = await extractImageFilesFromDataTransfer(event.dataTransfer);
        if (files.length > 0 || rejectedCount > 0) {
          onDropFilesOnFrame(frameIndex, files, rejectedCount);
        }
      },
      [frameIndex, onAssignAssetId, onDropFilesOnFrame]
    );

    const screenRadiusClass = !showBezel
      ? 'rounded-[20px]'
      : formFactor === 'macbook'
        ? 'rounded-t-[11px] rounded-b-[2px]'
        : formFactor === 'browser'
          ? 'rounded-b-[14px]'
          : 'rounded-[8px]';

    const screenContent = (
      <div
        onClick={() => onSelectFrame(frameIndex)}
        style={{
          width: `${spec.screenWidth}px`,
          height: `${spec.screenHeight}px`,
          colorScheme: 'dark',
          contain: 'layout style paint',
        }}
        className={`relative overflow-hidden bg-[#0a0a0c] select-none ${screenRadiusClass}`}
      >
        {override ? (
          <>
            <img
              src={override.objectUrl}
              alt={override.name}
              width={spec.screenWidth}
              height={spec.screenHeight}
              decoding="async"
              draggable={false}
              className={`w-full h-full ${
                override.fit === 'contain' ? 'object-contain bg-[#0a0a0c]' : 'object-cover'
              }`}
            />

            {!isCapturing && (
              <div className="absolute top-5 right-5 z-20 flex items-center gap-2 opacity-0 group-hover/desktop:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleOverrideFit(frameIndex);
                  }}
                  aria-label={
                    override.fit === 'cover'
                      ? 'Switch image to fit inside display'
                      : 'Switch image to fill display'
                  }
                  title={override.fit === 'cover' ? 'Fit entire image' : 'Fill screen'}
                  className="w-10 h-10 rounded-xl bg-black/75 text-white border border-white/15 backdrop-blur-md inline-flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  {override.fit === 'cover' ? (
                    <Minimize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Maximize2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onClearOverride(frameIndex);
                  }}
                  aria-label="Clear desktop display"
                  title="Clear display"
                  className="w-10 h-10 rounded-xl bg-black/75 text-white border border-white/15 backdrop-blur-md inline-flex items-center justify-center hover:bg-black/90 transition-colors"
                >
                  <X className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        ) : effectiveIframeSrc ? (
          <>
            <iframe
              key={iframeKey}
              src={effectiveIframeSrc}
              title={`${spec.deviceName} live preview`}
              width={spec.screenWidth}
              height={spec.screenHeight}
              onLoad={handleIframeLoad}
              style={{
                width: `${spec.screenWidth}px`,
                height: `${spec.screenHeight}px`,
                colorScheme: 'dark',
              }}
              className="border-0 bg-[#0a0a0c] block"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />

            {!isCapturing && iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0a0a0c]/88 backdrop-blur-sm text-neutral-300">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" aria-hidden="true" />
                <span className="text-sm font-medium">Loading desktop preview…</span>
              </div>
            )}

            {!isCapturing && iframeBlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3.5 px-10 text-center bg-[#0a0a0c]/94 text-neutral-200">
                <p className="text-base font-semibold text-white">
                  Preview may be blocked by this site
                </p>
                <p className="text-sm leading-relaxed text-neutral-400 max-w-md">
                  Some websites restrict embedding inside frames. You can retry or open the site directly.
                </p>
                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setLocalReload((prev) => prev + 1);
                    }}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white/10 hover:bg-white/16 border border-white/12 text-xs font-medium text-white transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                  <a
                    href={effectiveIframeSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Open tab</span>
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center px-10 text-center bg-[radial-gradient(ellipse_at_50%_38%,#17171b_0%,#0c0c0e_68%,#08080a_100%)]">
            {!isCapturing && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectFrame(frameIndex);
                  onOpenAssetTray();
                }}
                className="group/empty flex flex-col items-center gap-4 px-9 py-7 rounded-2xl border border-dashed border-white/14 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/26 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 inline-flex items-center justify-center text-neutral-300 group-hover/empty:text-white transition-colors">
                  <ImagePlus className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-neutral-100">
                    {spec.deviceName}
                    <span className="text-neutral-500 mx-2" aria-hidden="true">
                      ·
                    </span>
                    <span className="font-mono-tabular text-neutral-400">
                      {spec.aspectRatioLabel}
                    </span>
                  </p>
                  <p className="text-xs leading-relaxed text-neutral-500 max-w-[280px]">
                    Drop a screenshot here, upload assets, or paste a live website URL below
                  </p>
                </div>
              </button>
            )}
          </div>
        )}

        {showBezel && formFactor === 'macbook' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-30 w-[144px] h-[22px] rounded-b-[10px] bg-[#060608] flex items-center justify-center"
          >
            <span className="w-[7px] h-[7px] rounded-full bg-[#111521] ring-1 ring-white/12" />
          </div>
        )}

        {!isCapturing && isDragOver && (
          <div className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] border-2 border-white/85 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2.5 rounded-xl bg-white text-neutral-950 text-sm font-semibold shadow-lg">
              Drop into {spec.deviceName}
            </span>
          </div>
        )}
      </div>
    );

    // Frameless display mode (Bezel OFF)
    if (!showBezel) {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            boxShadow: deviceShadow || undefined,
          }}
          className={`group/desktop relative rounded-[20px] shrink-0 transition-shadow duration-200 ${
            !isCapturing && isSelected
              ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-transparent'
              : ''
          }`}
        >
          {screenContent}
        </div>
      );
    }

    // 1. Desktop 16:9 Studio Monitor
    if (formFactor === 'desktop') {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="group/desktop relative flex flex-col items-center shrink-0"
        >
          {/* Display enclosure */}
          <div
            style={{
              background: finish.chassisGradient,
              boxShadow: deviceShadow || undefined,
              padding: '3px',
            }}
            className={`relative rounded-[22px] transition-shadow duration-200 ${
              !isCapturing && isSelected
                ? 'ring-2 ring-white/45 ring-offset-2 ring-offset-transparent'
                : ''
            }`}
          >
            <div
              style={{ boxShadow: `inset 0 0 0 1px ${finish.rimHighlight}` }}
              className="relative rounded-[19px] overflow-hidden bg-[#070709]"
            >
              {/* Slim dark glass surround */}
              <div className="relative pt-[16px] px-[14px] pb-[14px]">
                {/* Centered studio webcam lens */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-[6px] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#141824] ring-1 ring-white/15"
                />
                {screenContent}
              </div>

              {/* Clean anodized metallic chin */}
              <div
                aria-hidden="true"
                style={{
                  background: metal.chinBg,
                  boxShadow: `inset 0 1px 0 ${metal.baseEdge}`,
                }}
                className="w-full h-[26px] flex items-center justify-center"
              >
                <span className="w-[38px] h-[3px] rounded-full bg-white/12" />
              </div>
            </div>
          </div>

          {/* Tapered anodized stand neck */}
          <div
            aria-hidden="true"
            style={{
              background: metal.neckGradient,
              clipPath: 'polygon(11% 0%, 89% 0%, 100% 100%, 0% 100%)',
              boxShadow: 'inset 0 10px 14px -8px rgba(0, 0, 0, 0.55)',
            }}
            className="w-[172px] h-[86px] -mt-[1px]"
          />

          {/* Weighted chamfered desk foot */}
          <div
            aria-hidden="true"
            style={{
              background: metal.baseGradient,
              boxShadow: `inset 0 1px 0 ${metal.baseEdge}${
                groundShadowOpacity > 0
                  ? `, 0 18px 34px -8px rgba(0, 0, 0, ${groundShadowOpacity})`
                  : ''
              }`,
            }}
            className="w-[344px] h-[14px] rounded-t-[4px] rounded-b-[10px]"
          />
        </div>
      );
    }

    // 2. MacBook Pro 16:10 Laptop
    if (formFactor === 'macbook') {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="group/desktop relative flex flex-col items-center shrink-0"
        >
          {/* Upper display lid */}
          <div
            style={{
              background: finish.chassisGradient,
              boxShadow: deviceShadow || undefined,
              padding: '3px 3px 2px 3px',
            }}
            className={`relative z-10 rounded-t-[24px] rounded-b-[6px] transition-shadow duration-200 ${
              !isCapturing && isSelected
                ? 'ring-2 ring-white/45 ring-offset-2 ring-offset-transparent'
                : ''
            }`}
          >
            <div
              style={{ boxShadow: `inset 0 0 0 1px ${finish.rimHighlight}` }}
              className="relative rounded-t-[21px] rounded-b-[4px] bg-[#060608] pt-[12px] px-[12px] pb-[16px]"
            >
              {screenContent}
            </div>
          </div>

          {/* Recessed hinge clutch */}
          <div
            aria-hidden="true"
            className="relative z-10 w-[860px] h-[7px] -mt-[2px] rounded-b-[4px] bg-[#08080a] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          />

          {/* Precision-machined aluminum base deck */}
          <div
            aria-hidden="true"
            style={{
              background: metal.lipGradient,
              boxShadow: `inset 0 1px 0 ${metal.baseEdge}, inset 0 -2px 4px rgba(0, 0, 0, 0.28)${
                groundShadowOpacity > 0
                  ? `, 0 26px 52px -12px rgba(0, 0, 0, ${groundShadowOpacity})`
                  : ''
              }`,
            }}
            className="relative z-20 -mt-[4px] w-[1360px] h-[22px] rounded-t-[3px] rounded-b-[16px] flex justify-center"
          >
            {/* Signature centered thumb scoop */}
            <div
              style={{
                background: metal.scoopBg,
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.45)',
              }}
              className="w-[172px] h-[8px] rounded-b-[8px]"
            />
          </div>

          {/* Rubber base feet */}
          <div
            aria-hidden="true"
            className="w-[1160px] flex items-center justify-between px-4 -mt-[1px]"
          >
            <span className="w-[74px] h-[5px] rounded-b-[4px] bg-[#0a0a0c]" />
            <span className="w-[74px] h-[5px] rounded-b-[4px] bg-[#0a0a0c]" />
          </div>
        </div>
      );
    }

    // 3. Ultrawide 21:9 Panoramic Creator Monitor
    if (formFactor === 'ultrawide') {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="group/desktop relative flex flex-col items-center shrink-0"
        >
          {/* Ultra-slim panoramic chassis */}
          <div
            style={{
              background: finish.chassisGradient,
              boxShadow: deviceShadow || undefined,
              padding: '3px',
            }}
            className={`relative rounded-[18px] transition-shadow duration-200 ${
              !isCapturing && isSelected
                ? 'ring-2 ring-white/45 ring-offset-2 ring-offset-transparent'
                : ''
            }`}
          >
            <div
              style={{ boxShadow: `inset 0 0 0 1px ${finish.rimHighlight}` }}
              className="relative rounded-[15px] overflow-hidden bg-[#070709]"
            >
              <div className="p-[10px] pb-[12px]">{screenContent}</div>
              {/* Subtle metallic bottom trim bar */}
              <div
                aria-hidden="true"
                style={{
                  background: metal.chinBg,
                  boxShadow: `inset 0 1px 0 ${metal.baseEdge}`,
                }}
                className="w-full h-[10px]"
              />
            </div>
          </div>

          {/* Low-profile central aluminum pillar */}
          <div
            aria-hidden="true"
            style={{
              background: metal.neckGradient,
              boxShadow: 'inset 0 10px 14px -8px rgba(0, 0, 0, 0.55)',
            }}
            className="w-[116px] h-[72px] -mt-[1px]"
          />

          {/* Wide architectural bar stand */}
          <div
            aria-hidden="true"
            style={{
              background: metal.baseGradient,
              boxShadow: `inset 0 1px 0 ${metal.baseEdge}${
                groundShadowOpacity > 0
                  ? `, 0 18px 36px -8px rgba(0, 0, 0, ${groundShadowOpacity})`
                  : ''
              }`,
            }}
            className="w-[468px] h-[12px] rounded-full"
          />
        </div>
      );
    }

    // 4. Desktop Browser / App Window (3:2)
    const displayAddress = formatDisplayAddress(customUrl, override);
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          boxShadow: deviceShadow || undefined,
          borderColor: metal.windowBorder,
        }}
        className={`group/desktop relative rounded-[16px] overflow-hidden border shrink-0 transition-shadow duration-200 ${
          !isCapturing && isSelected
            ? 'ring-2 ring-white/45 ring-offset-2 ring-offset-transparent'
            : ''
        }`}
      >
        {/* Native desktop window titlebar */}
        <div
          style={{
            background: metal.windowBarBg,
            borderBottom: `1px solid ${metal.windowBorder}`,
          }}
          className="h-[42px] px-4 flex items-center justify-between select-none"
        >
          {/* Window traffic lights */}
          <div className="flex items-center gap-2 w-[96px] shrink-0" aria-hidden="true">
            <span className="w-[12px] h-[12px] rounded-full bg-[#FF5F57] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)]" />
            <span className="w-[12px] h-[12px] rounded-full bg-[#FEBC2E] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)]" />
            <span className="w-[12px] h-[12px] rounded-full bg-[#28C840] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.2)]" />
          </div>

          {/* Centered minimal address bar */}
          <div
            style={{
              background: metal.windowAddressBg,
              color: metal.windowAddressText,
            }}
            className="h-[26px] w-[360px] max-w-[52%] px-3 rounded-lg flex items-center justify-center text-[11px] font-medium tracking-tight truncate"
          >
            <span className="truncate">{displayAddress}</span>
          </div>

          {/* Right symmetry spacer */}
          <div className="w-[96px] shrink-0" aria-hidden="true" />
        </div>

        {screenContent}
      </div>
    );
  }
);

DesktopMockup.displayName = 'DesktopMockup';
