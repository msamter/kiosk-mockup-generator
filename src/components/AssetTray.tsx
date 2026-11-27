import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FolderUp,
  ImagePlus,
  Layers,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { UploadedAsset } from '../types/assets';
import {
  extractImageFilesFromDataTransfer,
  filterSupportedImages,
  MAX_UPLOAD_ASSETS,
} from '../utils/assetFiles';

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
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const folderInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragHover, setIsDragHover] = useState(false);

    useEffect(() => {
      if (!isOpen) {
        setIsDragHover(false);
        return;
      }
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

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
      async (event: React.DragEvent<HTMLDivElement>) => {
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
      ? 'bg-white/94 border-black/12 text-neutral-900 shadow-[0_20px_56px_rgba(0,0,0,0.16)]'
      : 'bg-neutral-950/94 border-white/14 text-neutral-100 shadow-[0_24px_64px_rgba(0,0,0,0.68)]';

    const subtleBtn = isLightSurface
      ? 'bg-black/5 hover:bg-black/10 text-neutral-800 border-black/8'
      : 'bg-white/7 hover:bg-white/14 text-neutral-200 border-white/10';

    const ghostBtn = isLightSurface
      ? 'text-neutral-500 hover:text-neutral-900 hover:bg-black/6'
      : 'text-neutral-400 hover:text-white hover:bg-white/10';

    const dropzoneClasses = isDragHover
      ? isLightSurface
        ? 'border-neutral-900 bg-black/5'
        : 'border-white bg-white/10'
      : isLightSurface
        ? 'border-black/14 bg-black/[0.02]'
        : 'border-white/14 bg-white/[0.02]';

    return (
      <section
        aria-label="Uploaded mockup assets"
        style={{
          bottom: 'max(88px, calc(36px + var(--studio-dock-height, 64px)))',
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
        className={`fixed left-1/2 -translate-x-1/2 z-40 w-[min(94vw,680px)] rounded-2xl border backdrop-blur-2xl p-3.5 transition-colors ${surfaceClasses}`}
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
              className={`font-mono-tabular text-[11px] px-1.5 py-0.5 rounded-md ${
                isLightSurface ? 'bg-black/6 text-neutral-600' : 'bg-white/10 text-neutral-300'
              }`}
            >
              {assets.length}/{MAX_UPLOAD_ASSETS}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${subtleBtn}`}
            >
              <ImagePlus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Upload</span>
            </button>

            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${subtleBtn}`}
            >
              <FolderUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Folder</span>
            </button>

            {assets.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={onAutoFillFrames}
                  title={`Distribute assets across ${visibleFrameCount} visible frame${visibleFrameCount === 1 ? '' : 's'}`}
                  className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${subtleBtn}`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Fill {visibleFrameCount}</span>
                </button>

                <button
                  type="button"
                  onClick={onClearAssets}
                  aria-label="Clear all uploaded assets"
                  title="Clear all uploaded assets"
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${ghostBtn}`}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close assets panel"
              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${ghostBtn}`}
            >
              <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>

        {assets.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full rounded-xl border border-dashed px-4 py-6 flex flex-col items-center justify-center gap-1.5 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${dropzoneClasses}`}
          >
            <Upload className="w-4 h-4 opacity-70" aria-hidden="true" />
            <span className="text-xs font-medium">
              Drop screenshots or click to upload
            </span>
            <span
              className={`text-[11px] ${
                isLightSurface ? 'text-neutral-500' : 'text-neutral-400'
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
                    className={`w-[64px] h-[112px] rounded-xl overflow-hidden border transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-current/45 ${
                      isLightSurface
                        ? 'border-black/12 bg-neutral-100'
                        : 'border-white/14 bg-neutral-900'
                    }`}
                  >
                    <img
                      src={asset.objectUrl}
                      alt={asset.name}
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
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-900/90 text-white border border-white/20 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>

                  <p
                    className={`mt-1 text-[10px] truncate text-center ${
                      isLightSurface ? 'text-neutral-600' : 'text-neutral-400'
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
                isLightSurface ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              Drag any screenshot onto a mockup frame, or click a thumbnail to place it in Frame{' '}
              <span className="font-mono-tabular font-semibold">{targetFrame}</span>.
            </p>
          </div>
        )}
      </section>
    );
  }
);

AssetTray.displayName = 'AssetTray';
