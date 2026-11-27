import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FolderUp,
  ImagePlus,
  Layers,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { UploadedAsset } from '../../types/assets';
import {
  extractImageFilesFromDataTransfer,
  filterSupportedImages,
  MAX_UPLOAD_ASSETS,
} from '../../utils/assetFiles';

interface AssetTrayProps {
  isOpen: boolean;
  isLightSurface: boolean;
  assets: readonly UploadedAsset[];
  visibleFrameCount: number;
  selectedFrameIndex: number | null;
  onAddFiles: (files: File[], rejectedCount?: number) => void;
  onAssignAssetToFrame: (asset: UploadedAsset, frameIndex: number) => void;
  onAutoFillFrames: () => void;
  onRemoveAsset: (assetId: string) => void;
  onClearAssets: () => void;
  onClose: () => void;
}

export const AssetTray: React.FC<AssetTrayProps> = React.memo(
  ({
    isOpen,
    isLightSurface,
    assets,
    visibleFrameCount,
    selectedFrameIndex,
    onAddFiles,
    onAssignAssetToFrame,
    onAutoFillFrames,
    onRemoveAsset,
    onClearAssets,
    onClose,
  }) => {
    const panelRef = useRef<HTMLElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const folderInputRef = useRef<HTMLInputElement | null>(null);
    const restoreFocusRafRef = useRef<number | null>(null);
    const [isDragHover, setIsDragHover] = useState(false);

    useEffect(() => {
      return () => {
        if (restoreFocusRafRef.current !== null) {
          cancelAnimationFrame(restoreFocusRafRef.current);
          restoreFocusRafRef.current = null;
        }
      };
    }, []);

    const closeAndRestoreFocus = useCallback(() => {
      onClose();
      if (restoreFocusRafRef.current !== null) {
        cancelAnimationFrame(restoreFocusRafRef.current);
      }
      restoreFocusRafRef.current = requestAnimationFrame(() => {
        restoreFocusRafRef.current = null;
        const trigger = document.querySelector<HTMLButtonElement>(
          '[data-asset-tray-trigger="true"]'
        );
        trigger?.focus();
      });
    }, [onClose]);

    useEffect(() => {
      if (!isOpen) {
        setIsDragHover(false);
        return;
      }

      const rafId = requestAnimationFrame(() => {
        panelRef.current?.focus();
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeAndRestoreFocus();
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (panelRef.current && !panelRef.current.contains(target)) {
          const trigger = (target as Element).closest?.('[data-asset-tray-trigger="true"]');
          if (!trigger) {
            onClose();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('pointerdown', handlePointerDown);
      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [isOpen, closeAndRestoreFocus, onClose]);

    const handleFileChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const list = event.target.files;
        if (list && list.length > 0) {
          const { files, rejectedCount } = filterSupportedImages(list);
          onAddFiles(files, rejectedCount);
        }
        event.target.value = '';
      },
      [onAddFiles]
    );

    const handleDrop = useCallback(
      async (event: React.DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragHover(false);
        const { files, rejectedCount } = await extractImageFilesFromDataTransfer(event.dataTransfer);
        if (files.length > 0 || rejectedCount > 0) {
          onAddFiles(files, rejectedCount);
        }
      },
      [onAddFiles]
    );

    if (!isOpen) return null;

    const targetFrame = selectedFrameIndex ?? 1;

    const surfaceClasses = isLightSurface
      ? 'bg-white/95 border-black/14 text-neutral-950 shadow-[0_20px_56px_rgba(0,0,0,0.16)]'
      : 'bg-neutral-950/95 border-white/14 text-neutral-100 shadow-[0_24px_64px_rgba(0,0,0,0.68)]';

    const subtleBtn = isLightSurface
      ? 'bg-black/5 hover:bg-black/10 text-neutral-900 border-black/10'
      : 'bg-white/8 hover:bg-white/14 text-neutral-100 border-white/12';

    const ghostBtn = isLightSurface
      ? 'text-neutral-600 hover:text-neutral-950 hover:bg-black/7'
      : 'text-neutral-300 hover:text-white hover:bg-white/11';

    const dropzoneClasses = isDragHover
      ? isLightSurface
        ? 'border-neutral-900 bg-black/5'
        : 'border-white bg-white/10'
      : isLightSurface
        ? 'border-black/18 bg-black/[0.02]'
        : 'border-white/16 bg-white/[0.02]';

    return (
      <section
        id="studio-asset-tray"
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Uploaded mockup assets"
        tabIndex={-1}
        style={{
          bottom:
            'max(calc(88px + env(safe-area-inset-bottom, 0px)), calc(var(--studio-dock-top-offset, 84px) + 16px))',
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!isDragHover) setIsDragHover(true);
        }}
        onDragLeave={(event) => {
          event.stopPropagation();
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragHover(false);
          }
        }}
        onDrop={handleDrop}
        className={`fixed left-1/2 -translate-x-1/2 z-[55] w-[min(94vw,680px)] max-h-[min(60dvh,var(--studio-dock-available-above,360px))] overflow-y-auto overscroll-contain rounded-2xl border backdrop-blur-2xl p-3.5 transition-colors focus:outline-none ${
          isLightSurface ? 'm3-scrollbar-light' : 'm3-scrollbar-dark'
        } ${surfaceClasses}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          ref={folderInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          webkitdirectory=""
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold tracking-tight">Screen Assets</span>
            <span
              className={`font-mono-tabular tabular-nums text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                isLightSurface ? 'bg-black/7 text-neutral-700' : 'bg-white/10 text-neutral-200'
              }`}
            >
              {assets.length}/{MAX_UPLOAD_ASSETS}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] h-11 px-3.5 rounded-full border text-xs font-medium transition-colors studio-focus-ring ${subtleBtn}`}
            >
              <ImagePlus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Upload</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] h-11 px-3.5 rounded-full border text-xs font-medium transition-colors studio-focus-ring ${subtleBtn}`}
            >
              <FolderUp className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Folder</span>
            </button>

            {assets.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onAutoFillFrames}
                  title={`Distribute assets across ${visibleFrameCount} visible frame${visibleFrameCount === 1 ? '' : 's'}`}
                  className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] h-11 px-3.5 rounded-full border text-xs font-medium transition-colors studio-focus-ring ${subtleBtn}`}
                >
                  <Layers className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="tabular-nums">Fill {visibleFrameCount}</span>
                </button>

                <button
                  type="button"
                  onClick={onClearAssets}
                  aria-label="Clear all uploaded assets"
                  title="Clear all uploaded assets"
                  className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-colors studio-focus-ring ${ghostBtn}`}
                >
                  <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={closeAndRestoreFocus}
              aria-label="Close assets panel"
              className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full transition-colors studio-focus-ring ${ghostBtn}`}
            >
              <X className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>

        {assets.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full min-h-[104px] rounded-xl border border-dashed px-4 py-6 flex flex-col items-center justify-center gap-1.5 text-center transition-colors studio-focus-ring ${dropzoneClasses}`}
          >
            <Upload className="w-4 h-4 shrink-0 opacity-75" aria-hidden="true" />
            <span className="text-xs font-medium">
              Drop screenshots or click to upload
            </span>
            <span
              className={`text-[11px] ${
                isLightSurface ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              PNG, JPG, WebP, or GIF — drag any thumbnail directly onto a frame
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/x-studio-asset-id', asset.id);
                    event.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="group relative shrink-0 w-[64px]"
                >
                  <button
                    type="button"
                    onClick={() => onAssignAssetToFrame(asset, targetFrame)}
                    title={`Click to place "${asset.name}" in Frame ${targetFrame}, or drag onto any frame`}
                    className={`w-[64px] h-[112px] rounded-xl overflow-hidden border transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] studio-focus-ring ${
                      isLightSurface
                        ? 'border-black/14 bg-neutral-100'
                        : 'border-white/14 bg-neutral-900'
                    }`}
                  >
                    <img
                      src={asset.objectUrl}
                      alt={asset.name}
                      width={64}
                      height={112}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveAsset(asset.id)}
                    aria-label={`Remove ${asset.name}`}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 before:content-[''] before:absolute before:-inset-2.5 rounded-full bg-neutral-900/95 text-white border border-white/25 inline-flex items-center justify-center opacity-0 [@media(hover:none)]:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity studio-focus-ring"
                  >
                    <X className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </button>

                  <p
                    className={`mt-1 text-[10px] truncate text-center ${
                      isLightSurface ? 'text-neutral-700' : 'text-neutral-300'
                    }`}
                    title={asset.name}
                  >
                    {asset.name}
                  </p>
                </div>
              ))}
            </div>

            <p
              className={`text-[11px] ${
                isLightSurface ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              Drag any screenshot onto a mockup frame, or click a thumbnail to place it in Frame{' '}
              <span className="font-mono-tabular tabular-nums font-semibold">{targetFrame}</span>.
            </p>
          </div>
        )}
      </section>
    );
  }
);

AssetTray.displayName = 'AssetTray';
