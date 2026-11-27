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
} from '../types/studio';
import { extractImageFilesFromDataTransfer } from '../utils/assetFiles';

interface SmartphoneMockupProps {
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

const IFRAME_LOAD_TIMEOUT_MS = 8500;

export const SmartphoneMockup: React.FC<SmartphoneMockupProps> = React.memo(
  ({
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

    const finish = BEZEL_FINISHES[bezelFinish];

    const deviceShadow = useMemo(
      () =>
        getAdaptiveDeviceShadow(
          backgroundTone,
          bezelFinish,
          showBezel ? 'phone' : 'window',
          isTransparentBackdrop && isCapturing
        ),
      [backgroundTone, bezelFinish, showBezel, isTransparentBackdrop, isCapturing]
    );

    const effectiveIframeSrc = !override && customUrl ? customUrl : null;
    const iframeKey = `${effectiveIframeSrc ?? 'none'}-${reloadNonce}-${localReload}`;

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

    const screenContent = (
      <div
        onClick={() => onSelectFrame(frameIndex)}
        style={{ colorScheme: 'dark', contain: 'layout style paint' }}
        className={`relative w-[375px] h-[780px] aspect-[375/780] overflow-hidden bg-[#0a0a0c] select-none ${
          showBezel ? 'rounded-[42px]' : 'rounded-[36px]'
        }`}
      >
        {override ? (
          <>
            <img
              src={override.objectUrl}
              alt={override.name}
              width={375}
              height={780}
              decoding="async"
              draggable={false}
              className={`w-full h-full ${
                override.fit === 'contain' ? 'object-contain bg-[#0a0a0c]' : 'object-cover'
              }`}
            />

            {!isCapturing && (
              <div className="absolute top-12 right-3.5 z-20 flex items-center gap-1.5 opacity-0 group-hover/phone:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleOverrideFit(frameIndex);
                  }}
                  aria-label={
                    override.fit === 'cover' ? 'Switch image to fit inside frame' : 'Switch image to fill frame'
                  }
                  title={override.fit === 'cover' ? 'Fit entire image' : 'Fill screen'}
                  className="w-8 h-8 rounded-lg bg-black/75 text-white border border-white/15 backdrop-blur-md inline-flex items-center justify-center hover:bg-black/90 transition-colors"
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
                  aria-label={`Clear frame ${frameIndex}`}
                  title="Clear frame"
                  className="w-8 h-8 rounded-lg bg-black/75 text-white border border-white/15 backdrop-blur-md inline-flex items-center justify-center hover:bg-black/90 transition-colors"
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
              title={`Mobile preview frame ${frameIndex}`}
              width={375}
              height={780}
              onLoad={handleIframeLoad}
              style={{ colorScheme: 'dark' }}
              className="w-[375px] h-[780px] border-0 bg-[#0a0a0c] block"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />

            {!isCapturing && iframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-[#0a0a0c]/88 backdrop-blur-sm text-neutral-300">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" aria-hidden="true" />
                <span className="text-xs font-medium">Loading preview…</span>
              </div>
            )}

            {!isCapturing && iframeBlocked && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-7 text-center bg-[#0a0a0c]/94 text-neutral-200">
                <p className="text-xs font-semibold text-white">Preview may be blocked by this site</p>
                <p className="text-[11px] leading-relaxed text-neutral-400">
                  Some websites restrict embedding inside frames. You can retry or open the site directly.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setLocalReload((prev) => prev + 1);
                    }}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/10 hover:bg-white/16 border border-white/12 text-xs font-medium text-white transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                  <a
                    href={effectiveIframeSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Open tab</span>
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center bg-[radial-gradient(ellipse_at_50%_35%,#17171b_0%,#0c0c0e_68%,#08080a_100%)]">
            {!isCapturing && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectFrame(frameIndex);
                  onOpenAssetTray();
                }}
                className="group/empty flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border border-dashed border-white/12 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/24 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 inline-flex items-center justify-center text-neutral-300 group-hover/empty:text-white transition-colors">
                  <ImagePlus className="w-4 h-4" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-neutral-200">
                    Frame <span className="font-mono-tabular">{frameIndex}</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-neutral-500 max-w-[190px]">
                    Drop an image here, upload assets, or paste a URL below
                  </p>
                </div>
              </button>
            )}
          </div>
        )}

        {showBezel && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-[11px] left-1/2 -translate-x-1/2 z-30 w-[106px] h-[30px] rounded-full bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] flex items-center justify-end pr-[10px]"
          >
            <span className="w-[10px] h-[10px] rounded-full bg-[#0d1018] ring-1 ring-white/10" />
          </div>
        )}

        {!isCapturing && isDragOver && (
          <div className="pointer-events-none absolute inset-0 z-40 rounded-[inherit] border-2 border-white/85 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3.5 py-2 rounded-xl bg-white text-neutral-950 text-xs font-semibold shadow-lg">
              Drop into Frame {frameIndex}
            </span>
          </div>
        )}
      </div>
    );

    if (!showBezel) {
      return (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            boxShadow: deviceShadow || undefined,
          }}
          className={`group/phone relative rounded-[36px] shrink-0 transition-shadow duration-200 ${
            !isCapturing && isSelected ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-transparent' : ''
          }`}
        >
          {screenContent}
        </div>
      );
    }

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="group/phone relative shrink-0"
      >
        {/* Left hardware buttons: silent switch + volume up/down */}
        <span
          aria-hidden="true"
          style={{
            background: finish.buttonColor,
            boxShadow: `inset 1px 0 0 ${finish.buttonHighlight}`,
          }}
          className="pointer-events-none absolute -left-[3px] top-[128px] w-[3px] h-[28px] rounded-l-[2px]"
        />
        <span
          aria-hidden="true"
          style={{
            background: finish.buttonColor,
            boxShadow: `inset 1px 0 0 ${finish.buttonHighlight}`,
          }}
          className="pointer-events-none absolute -left-[3px] top-[174px] w-[3px] h-[54px] rounded-l-[2px]"
        />
        <span
          aria-hidden="true"
          style={{
            background: finish.buttonColor,
            boxShadow: `inset 1px 0 0 ${finish.buttonHighlight}`,
          }}
          className="pointer-events-none absolute -left-[3px] top-[242px] w-[3px] h-[54px] rounded-l-[2px]"
        />

        {/* Right hardware button: power */}
        <span
          aria-hidden="true"
          style={{
            background: finish.buttonColor,
            boxShadow: `inset -1px 0 0 ${finish.buttonHighlight}`,
          }}
          className="pointer-events-none absolute -right-[3px] top-[204px] w-[3px] h-[78px] rounded-r-[2px]"
        />

        {/* Outer metallic chassis */}
        <div
          style={{
            background: finish.chassisGradient,
            boxShadow: deviceShadow || undefined,
            padding: '4px',
          }}
          className={`relative rounded-[54px] transition-shadow duration-200 ${
            !isCapturing && isSelected ? 'ring-2 ring-white/45 ring-offset-2 ring-offset-transparent' : ''
          }`}
        >
          {/* Inner glossy black bezel */}
          <div
            style={{
              boxShadow: `inset 0 0 0 1px ${finish.rimHighlight}`,
            }}
            className="relative rounded-[50px] bg-[#060607] p-[9px]"
          >
            {/* Top earpiece speaker micro-slot */}
            <span
              aria-hidden="true"
              style={{ backgroundColor: finish.speakerColor }}
              className="pointer-events-none absolute top-[4px] left-1/2 -translate-x-1/2 w-[52px] h-[3px] rounded-full opacity-80"
            />
            {screenContent}
          </div>
        </div>
      </div>
    );
  }
);

SmartphoneMockup.displayName = 'SmartphoneMockup';
