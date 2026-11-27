import React, { useCallback, useEffect, useRef, useState } from 'react';
import { extractImageFilesFromDataTransfer } from '../utils/assetFiles';

interface UseFrameDropZoneOptions {
  frameIndex: number;
  selectOnDrop?: boolean;
  onSelectFrame?: (frameIndex: number) => void;
  onAssignAssetId: (frameIndex: number, assetId: string) => void;
  onDropFilesOnFrame: (frameIndex: number, files: File[], rejectedCount: number) => void;
}

interface UseFrameDropZoneResult {
  isDragOver: boolean;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => Promise<void>;
}

const STUDIO_ASSET_MIME = 'application/x-studio-asset-id';

function isSupportedDragPayload(dataTransfer: DataTransfer): boolean {
  const types = Array.from(dataTransfer.types ?? []);
  return types.includes(STUDIO_ASSET_MIME) || types.includes('Files');
}

/**
 * Shared drag-and-drop handler for all device mockup screens.
 * - Ignores non-file / non-asset drags (e.g. highlighted text or links)
 * - Clears stuck drag overlays on window dragend / drop / blur
 * - Guards async directory/file extraction against unmounted components
 */
export function useFrameDropZone({
  frameIndex,
  selectOnDrop = false,
  onSelectFrame,
  onAssignAssetId,
  onDropFilesOnFrame,
}: UseFrameDropZoneOptions): UseFrameDropZoneResult {
  const [isDragOver, setIsDragOver] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isDragOver) return;
    const clearDrag = () => setIsDragOver(false);
    window.addEventListener('dragend', clearDrag);
    window.addEventListener('drop', clearDrag);
    window.addEventListener('blur', clearDrag);
    return () => {
      window.removeEventListener('dragend', clearDrag);
      window.removeEventListener('drop', clearDrag);
      window.removeEventListener('blur', clearDrag);
    };
  }, [isDragOver]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!isSupportedDragPayload(event.dataTransfer)) {
      return;
    }
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
      const assetId = event.dataTransfer.getData(STUDIO_ASSET_MIME);
      const hasFiles = Array.from(event.dataTransfer.types ?? []).includes('Files');
      if (!assetId && !hasFiles) {
        setIsDragOver(false);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (selectOnDrop) {
        onSelectFrame?.(frameIndex);
      }

      if (assetId) {
        onAssignAssetId(frameIndex, assetId);
        return;
      }

      const { files, rejectedCount } = await extractImageFilesFromDataTransfer(event.dataTransfer);
      if (!isMountedRef.current) return;
      if (files.length > 0 || rejectedCount > 0) {
        onDropFilesOnFrame(frameIndex, files, rejectedCount);
      }
    },
    [frameIndex, onAssignAssetId, onDropFilesOnFrame, onSelectFrame, selectOnDrop]
  );

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
