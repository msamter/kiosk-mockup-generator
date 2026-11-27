import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { AssetTray } from './components/AssetTray';
import { ScreenshotButton } from './components/ScreenshotButton';
import { StageComposition } from './components/StageComposition';
import { StudioControls } from './components/StudioControls';
import { StudioToastHost, StudioToastHostHandle } from './components/StudioToastHost';
import { useStudioShortcuts } from './hooks/useStudioShortcuts';
import { useViewportScale } from './hooks/useViewportScale';
import { FrameOverride, UploadedAsset } from './types/assets';
import {
  AngleSceneId,
  BezelFinishId,
  CharismaSceneId,
  getStudioBackgroundStyle,
  getThemeForScene,
  GridSceneId,
  HourglassSceneId,
  isAngleScene,
  isCharismaScene,
  isGridScene,
  isHourglassScene,
  isScribeScene,
  isTerminalScene,
  SCENE_FRAME_INDICES,
  SCENE_LAYOUT_CLASSES,
  SCENE_STAGE_LABELS,
  SCENE_VISIBLE_COUNTS,
  ScribeSceneId,
  StudioPageId,
  StudioThemeId,
  TerminalSceneId,
  THEME_SCENES,
} from './types/studio';
import {
  extractImageFilesFromDataTransfer,
  MAX_UPLOAD_ASSETS,
  prepareUploadedAsset,
} from './utils/assetFiles';
import { captureCleanShowcase } from './utils/captureStage';
import {
  loadPersistedScalePercent,
  loadStudioSettings,
  saveStudioSettings,
} from './utils/studioStorage';

export function App() {
  const initialSettings = useMemo(() => loadStudioSettings(), []);

  const [activeScene, setActiveScene] = useState<StudioPageId>(initialSettings.activeScene);
  const [lastGridScene, setLastGridScene] = useState<GridSceneId>(() =>
    isGridScene(initialSettings.activeScene) ? initialSettings.activeScene : 1
  );
  const [lastAngleScene, setLastAngleScene] = useState<AngleSceneId>(() =>
    isAngleScene(initialSettings.activeScene) ? initialSettings.activeScene : 'peek'
  );
  const [lastCharismaScene, setLastCharismaScene] = useState<CharismaSceneId>(() =>
    isCharismaScene(initialSettings.activeScene) ? initialSettings.activeScene : 'duo'
  );
  const [lastTerminalScene, setLastTerminalScene] = useState<TerminalSceneId>(() =>
    isTerminalScene(initialSettings.activeScene) ? initialSettings.activeScene : 'desktop'
  );
  const [lastScribeScene, setLastScribeScene] = useState<ScribeSceneId>(() =>
    isScribeScene(initialSettings.activeScene) ? initialSettings.activeScene : 'tablet-1'
  );
  const [lastHourglassScene, setLastHourglassScene] = useState<HourglassSceneId>(() =>
    isHourglassScene(initialSettings.activeScene) ? initialSettings.activeScene : 'watch-1'
  );
  const [backgroundTone, setBackgroundTone] = useState<number>(initialSettings.backgroundTone);
  const [isTransparentBackdrop, setIsTransparentBackdrop] = useState<boolean>(
    initialSettings.isTransparentBackdrop
  );
  const [showBezel, setShowBezel] = useState<boolean>(initialSettings.showBezel);
  const [bezelFinish, setBezelFinish] = useState<BezelFinishId>(initialSettings.bezelFinish);
  const [customUrl, setCustomUrl] = useState<string | null>(initialSettings.customUrl);

  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [frameOverrides, setFrameOverrides] = useState<Record<number, FrameOverride>>({});
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(1);
  const [reloadNonce, setReloadNonce] = useState(0);

  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [assetTrayOpen, setAssetTrayOpen] = useState(false);
  const [urlPopoverOpen, setUrlPopoverOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCaptureBusy, setIsCaptureBusy] = useState(false);
  const [isWindowDragOver, setIsWindowDragOver] = useState(false);

  const stageContentRef = useRef<HTMLDivElement | null>(null);
  const toastRef = useRef<StudioToastHostHandle | null>(null);
  const assetsRef = useRef<UploadedAsset[]>([]);
  const activeObjectUrlsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);
  const dragDepthRef = useRef(0);

  assetsRef.current = assets;

  const trackObjectUrl = useCallback((url: string) => {
    activeObjectUrlsRef.current.add(url);
  }, []);

  const revokeObjectUrl = useCallback((url: string) => {
    if (activeObjectUrlsRef.current.delete(url)) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const activeTheme: StudioThemeId = getThemeForScene(activeScene);
  const activeThemeScenes = THEME_SCENES[activeTheme];
  const fitScale = useViewportScale(activeScene);
  const studioBg = useMemo(() => getStudioBackgroundStyle(backgroundTone), [backgroundTone]);
  const isLightSurface = isTransparentBackdrop ? true : studioBg.isLightSurface;
  const visibleFrames = SCENE_FRAME_INDICES[activeScene];
  const visibleFrameCount = SCENE_VISIBLE_COUNTS[activeScene];

  useEffect(() => {
    saveStudioSettings({
      activeScene,
      backgroundTone,
      isTransparentBackdrop,
      showBezel,
      bezelFinish,
      customUrl,
    });
  }, [activeScene, backgroundTone, isTransparentBackdrop, showBezel, bezelFinish, customUrl]);

  useEffect(() => {
    const target = stageContentRef.current;
    if (target) {
      const initialPercent = loadPersistedScalePercent();
      target.style.setProperty('--stage-user-scale', String(initialPercent / 100));
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const trackedUrls = activeObjectUrlsRef.current;
    const clearDragOverlay = () => {
      dragDepthRef.current = 0;
      setIsWindowDragOver(false);
    };
    window.addEventListener('dragend', clearDragOverlay);
    window.addEventListener('blur', clearDragOverlay);
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('dragend', clearDragOverlay);
      window.removeEventListener('blur', clearDragOverlay);
      trackedUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      trackedUrls.clear();
    };
  }, []);

  useEffect(() => {
    if (selectedFrameIndex !== null && selectedFrameIndex > visibleFrameCount) {
      setSelectedFrameIndex(1);
    }
  }, [visibleFrameCount, selectedFrameIndex]);

  const addPreparedFiles = useCallback(
    async (
      files: File[],
      rejectedCount = 0,
      targetFrameIndex?: number
    ): Promise<void> => {
      if (files.length === 0) {
        if (rejectedCount > 0) {
          toastRef.current?.show(
            `Skipped ${rejectedCount} unsupported or oversized file${rejectedCount === 1 ? '' : 's'} (max 25 MB PNG, JPG, WebP, or GIF).`,
            'error'
          );
        }
        return;
      }

      const settled = await Promise.allSettled(files.map((file) => prepareUploadedAsset(file)));
      const prepared: UploadedAsset[] = [];
      let failedCount = 0;

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          prepared.push(result.value);
        } else {
          failedCount += 1;
        }
      }

      if (!isMountedRef.current) {
        prepared.forEach((asset) => URL.revokeObjectURL(asset.objectUrl));
        return;
      }

      if (prepared.length === 0) {
        toastRef.current?.show(
          'Could not load the selected image file. Please try a PNG, JPG, WebP, or GIF.',
          'error'
        );
        return;
      }

      prepared.forEach((asset) => trackObjectUrl(asset.objectUrl));

      const combined = [...prepared, ...assetsRef.current];
      const nextAssets =
        combined.length > MAX_UPLOAD_ASSETS ? combined.slice(0, MAX_UPLOAD_ASSETS) : combined;
      const evicted =
        combined.length > MAX_UPLOAD_ASSETS ? combined.slice(MAX_UPLOAD_ASSETS) : [];

      const revokedIds = new Set<string>();
      evicted.forEach((item) => {
        revokedIds.add(item.id);
        revokeObjectUrl(item.objectUrl);
      });

      assetsRef.current = nextAssets;
      setAssets(nextAssets);

      if (revokedIds.size > 0) {
        setFrameOverrides((prev) => {
          let changed = false;
          const next: Record<number, FrameOverride> = {};
          for (const [key, value] of Object.entries(prev)) {
            if (revokedIds.has(value.assetId)) {
              changed = true;
            } else {
              next[Number(key)] = value;
            }
          }
          return changed ? next : prev;
        });
      }

      if (typeof targetFrameIndex === 'number') {
        setFrameOverrides((prev) => {
          const next = { ...prev };
          prepared.forEach((asset, offset) => {
            const slot = targetFrameIndex + offset;
            if (slot <= visibleFrameCount) {
              next[slot] = {
                assetId: asset.id,
                objectUrl: asset.objectUrl,
                name: asset.name,
                fit: 'cover',
              };
            }
          });
          return next;
        });
        setSelectedFrameIndex(targetFrameIndex);
      }

      const skippedTotal = rejectedCount + failedCount;
      if (skippedTotal > 0) {
        toastRef.current?.show(
          `Added ${prepared.length} image${prepared.length === 1 ? '' : 's'} (${skippedTotal} skipped).`,
          'info'
        );
      } else {
        toastRef.current?.show(
          typeof targetFrameIndex === 'number'
            ? `Placed ${prepared.length === 1 ? `"${prepared[0].name}"` : `${prepared.length} images`} on stage.`
            : `Added ${prepared.length} screen asset${prepared.length === 1 ? '' : 's'}.`,
          'success'
        );
      }
    },
    [visibleFrameCount, revokeObjectUrl, trackObjectUrl]
  );

  const handleAssignAssetToFrame = useCallback((asset: UploadedAsset, frameIndex: number) => {
    setFrameOverrides((prev) => ({
      ...prev,
      [frameIndex]: {
        assetId: asset.id,
        objectUrl: asset.objectUrl,
        name: asset.name,
        fit: 'cover',
      },
    }));
    setSelectedFrameIndex(frameIndex);
  }, []);

  const handleAssignAssetId = useCallback((frameIndex: number, assetId: string) => {
    const found = assetsRef.current.find((item) => item.id === assetId);
    if (!found) return;
    setFrameOverrides((prev) => ({
      ...prev,
      [frameIndex]: {
        assetId: found.id,
        objectUrl: found.objectUrl,
        name: found.name,
        fit: 'cover',
      },
    }));
    setSelectedFrameIndex(frameIndex);
  }, []);

  const handleDropFilesOnFrame = useCallback(
    (frameIndex: number, files: File[], rejectedCount: number) => {
      void addPreparedFiles(files, rejectedCount, frameIndex);
    },
    [addPreparedFiles]
  );

  const handleAutoFillFrames = useCallback(() => {
    const currentAssets = assetsRef.current;
    if (currentAssets.length === 0) return;
    setFrameOverrides((prev) => {
      const next = { ...prev };
      visibleFrames.forEach((frameNum, index) => {
        const asset = currentAssets[index % currentAssets.length];
        next[frameNum] = {
          assetId: asset.id,
          objectUrl: asset.objectUrl,
          name: asset.name,
          fit: 'cover',
        };
      });
      return next;
    });
    toastRef.current?.show(
      `Filled ${visibleFrames.length} frame${visibleFrames.length === 1 ? '' : 's'} with your assets.`,
      'success'
    );
  }, [visibleFrames]);

  const handleToggleOverrideFit = useCallback((frameIndex: number) => {
    setFrameOverrides((prev) => {
      const current = prev[frameIndex];
      if (!current) return prev;
      return {
        ...prev,
        [frameIndex]: {
          ...current,
          fit: current.fit === 'cover' ? 'contain' : 'cover',
        },
      };
    });
  }, []);

  const handleClearOverride = useCallback((frameIndex: number) => {
    setFrameOverrides((prev) => {
      if (!prev[frameIndex]) return prev;
      const next = { ...prev };
      delete next[frameIndex];
      return next;
    });
  }, []);

  const handleRemoveAsset = useCallback(
    (assetId: string) => {
      const target = assetsRef.current.find((item) => item.id === assetId);
      if (target) {
        revokeObjectUrl(target.objectUrl);
      }
      setAssets((prev) => prev.filter((item) => item.id !== assetId));
      setFrameOverrides((prev) => {
        let changed = false;
        const next: Record<number, FrameOverride> = {};
        for (const [key, value] of Object.entries(prev)) {
          if (value.assetId === assetId) {
            changed = true;
          } else {
            next[Number(key)] = value;
          }
        }
        return changed ? next : prev;
      });
    },
    [revokeObjectUrl]
  );

  const handleClearAssets = useCallback(() => {
    assetsRef.current.forEach((asset) => {
      revokeObjectUrl(asset.objectUrl);
    });
    setAssets([]);
    setFrameOverrides({});
    toastRef.current?.show('Cleared all uploaded assets.', 'info');
  }, [revokeObjectUrl]);

  const handleSelectBackgroundTone = useCallback((tone: number) => {
    setIsTransparentBackdrop(false);
    setBackgroundTone(tone);
  }, []);

  const handleToggleTransparentBackdrop = useCallback(() => {
    setIsTransparentBackdrop((prev) => !prev);
  }, []);

  const handleToggleBezel = useCallback(() => {
    setShowBezel((prev) => !prev);
  }, []);

  const handleSelectBezelFinish = useCallback((finish: BezelFinishId) => {
    setShowBezel(true);
    setBezelFinish(finish);
  }, []);

  const handleSelectScene = useCallback((scene: StudioPageId) => {
    setActiveScene(scene);
    if (isAngleScene(scene)) {
      setLastAngleScene(scene);
    } else if (isCharismaScene(scene)) {
      setLastCharismaScene(scene);
    } else if (isTerminalScene(scene)) {
      setLastTerminalScene(scene);
    } else if (isScribeScene(scene)) {
      setLastScribeScene(scene);
    } else if (isHourglassScene(scene)) {
      setLastHourglassScene(scene);
    } else {
      setLastGridScene(scene);
    }
  }, []);

  const handleSelectTheme = useCallback(
    (theme: StudioThemeId) => {
      if (theme === 'angles') {
        setActiveScene((current) => (isAngleScene(current) ? current : lastAngleScene));
      } else if (theme === 'charisma') {
        setActiveScene((current) => (isCharismaScene(current) ? current : lastCharismaScene));
      } else if (theme === 'terminal') {
        setActiveScene((current) => (isTerminalScene(current) ? current : lastTerminalScene));
      } else if (theme === 'scribe') {
        setActiveScene((current) => (isScribeScene(current) ? current : lastScribeScene));
      } else if (theme === 'hourglass') {
        setActiveScene((current) => (isHourglassScene(current) ? current : lastHourglassScene));
      } else {
        setActiveScene((current) => (isGridScene(current) ? current : lastGridScene));
      }
    },
    [
      lastAngleScene,
      lastCharismaScene,
      lastGridScene,
      lastHourglassScene,
      lastScribeScene,
      lastTerminalScene,
    ]
  );

  const handleToggleThemeMenu = useCallback(() => {
    setAssetTrayOpen(false);
    setUrlPopoverOpen(false);
    setThemeMenuOpen((prev) => !prev);
  }, []);

  const handleCloseThemeMenu = useCallback(() => {
    setThemeMenuOpen(false);
  }, []);

  const handleToggleAssetTray = useCallback(() => {
    setThemeMenuOpen(false);
    setUrlPopoverOpen(false);
    setAssetTrayOpen((prev) => !prev);
  }, []);

  const handleToggleUrlPopover = useCallback(() => {
    setThemeMenuOpen(false);
    setAssetTrayOpen(false);
    setUrlPopoverOpen((prev) => !prev);
  }, []);

  const handleCloseUrlPopover = useCallback(() => {
    setUrlPopoverOpen(false);
  }, []);

  const handleApplyCustomUrl = useCallback((normalizedUrl: string, displayHost: string) => {
    setFrameOverrides({});
    setCustomUrl(normalizedUrl);
    setReloadNonce((prev) => prev + 1);
    toastRef.current?.show(`Loaded ${displayHost} across stage frames.`, 'success');
  }, []);

  const handleClearCustomUrl = useCallback(() => {
    setCustomUrl(null);
    toastRef.current?.show('Cleared live URL preview.', 'info');
  }, []);

  const handleResetFrames = useCallback(() => {
    setFrameOverrides({});
    setCustomUrl(null);
    setSelectedFrameIndex(1);
    toastRef.current?.show('Reset all frames to blank.', 'info');
  }, []);

  const handleReloadFrames = useCallback(() => {
    setReloadNonce((prev) => prev + 1);
    toastRef.current?.show('Reloaded active frames.', 'info', 2200);
  }, []);

  const handleToggleMinimized = useCallback(() => {
    setIsMinimized((prev) => {
      const next = !prev;
      if (next) {
        setThemeMenuOpen(false);
        setAssetTrayOpen(false);
        setUrlPopoverOpen(false);
      }
      return next;
    });
  }, []);

  useStudioShortcuts({
    disabled: isCapturing,
    availableScenes: activeThemeScenes,
    onToggleTaskbar: handleToggleMinimized,
    onSelectScene: handleSelectScene,
  });

  const handleOpenAssetTray = useCallback(() => {
    setIsMinimized(false);
    setThemeMenuOpen(false);
    setUrlPopoverOpen(false);
    setAssetTrayOpen(true);
  }, []);

  const handleScreenshot = useCallback(async () => {
    if (isCaptureBusy) return;
    setIsCaptureBusy(true);
    setThemeMenuOpen(false);
    setAssetTrayOpen(false);
    setUrlPopoverOpen(false);

    let contentBounds: { widthRatio: number; heightRatio: number } | null = null;
    const stageEl = stageContentRef.current;
    if (stageEl && window.innerWidth > 0 && window.innerHeight > 0) {
      const rect = stageEl.getBoundingClientRect();
      contentBounds = {
        widthRatio: Math.min(1, rect.width / window.innerWidth),
        heightRatio: Math.min(1, rect.height / window.innerHeight),
      };
    }

    const outcome = await captureCleanShowcase({
      aspectRatio: '16:9',
      sceneLabel: isGridScene(activeScene) ? `${activeScene}up` : activeScene,
      transparentBackground: isTransparentBackdrop,
      backdropEdgeColor: studioBg.solidEdge,
      contentBounds,
      onHideChrome: () => {
        if (isMountedRef.current) setIsCapturing(true);
      },
      onRestoreChrome: () => {
        if (isMountedRef.current) setIsCapturing(false);
      },
    });

    if (!isMountedRef.current) return;
    setIsCaptureBusy(false);

    if (outcome.status === 'saved') {
      toastRef.current?.show(`Saved ${outcome.filename}`, 'success', 3800);
    } else if (outcome.status === 'unsupported' || outcome.status === 'error') {
      toastRef.current?.show(outcome.reason, 'error', 4800);
    }
  }, [activeScene, isCaptureBusy, isTransparentBackdrop, studioBg.solidEdge]);

  const handleWindowDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsWindowDragOver(true);
    }
  }, []);

  const handleWindowDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault();
    }
  }, []);

  const handleWindowDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsWindowDragOver(false);
      }
    }
  }, []);

  const handleWindowDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      dragDepthRef.current = 0;
      setIsWindowDragOver(false);
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      const { files, rejectedCount } = await extractImageFilesFromDataTransfer(event.dataTransfer);
      if (files.length > 0 || rejectedCount > 0) {
        await addPreparedFiles(files, rejectedCount, selectedFrameIndex ?? 1);
      }
    },
    [addPreparedFiles, selectedFrameIndex]
  );

  const handleFullscreenError = useCallback((message: string) => {
    toastRef.current?.show(message, 'error', 4200);
  }, []);

  const handleWindowDropCapture = useCallback(() => {
    dragDepthRef.current = 0;
    setIsWindowDragOver(false);
  }, []);

  const stageBackdropStyle: React.CSSProperties = isTransparentBackdrop
    ? isCapturing
      ? { backgroundColor: '#ff00ff' }
      : {}
    : { background: studioBg.background };

  return (
    <div
      onDragEnter={handleWindowDragEnter}
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDropCapture={handleWindowDropCapture}
      onDrop={handleWindowDrop}
      style={stageBackdropStyle}
      className={`relative h-dvh w-screen overflow-hidden overflow-x-clip flex items-center justify-center ${
        isTransparentBackdrop && !isCapturing ? 'studio-checkerboard' : ''
      } ${isCapturing ? 'studio-hide-cursor' : ''}`}
    >
      <ScreenshotButton
        isCapturing={isCapturing}
        isBusy={isCaptureBusy}
        isLightSurface={isLightSurface}
        onCapture={handleScreenshot}
        onFullscreenError={handleFullscreenError}
      />

      <StudioToastHost
        ref={toastRef}
        hidden={isCapturing}
        isLightSurface={isLightSurface}
      />

      <main
        aria-label={SCENE_STAGE_LABELS[activeScene]}
        className="w-full h-full flex items-center justify-center overflow-hidden overflow-x-clip select-none"
      >
        <div
          ref={stageContentRef}
          style={{ '--stage-fit-scale': fitScale } as React.CSSProperties}
          className={`studio-stage-scaler ${SCENE_LAYOUT_CLASSES[activeScene]}`}
        >
          <StageComposition
            activeScene={activeScene}
            showBezel={showBezel}
            bezelFinish={bezelFinish}
            backgroundTone={backgroundTone}
            isTransparentBackdrop={isTransparentBackdrop}
            isCapturing={isCapturing}
            customUrl={customUrl}
            reloadNonce={reloadNonce}
            frameOverrides={frameOverrides}
            selectedFrameIndex={selectedFrameIndex}
            onSelectFrame={setSelectedFrameIndex}
            onAssignAssetId={handleAssignAssetId}
            onDropFilesOnFrame={handleDropFilesOnFrame}
            onToggleOverrideFit={handleToggleOverrideFit}
            onClearOverride={handleClearOverride}
            onOpenAssetTray={handleOpenAssetTray}
          />
        </div>
      </main>

      <AssetTray
        isOpen={!isCapturing && !isMinimized && assetTrayOpen}
        isLightSurface={isLightSurface}
        assets={assets}
        visibleFrameCount={visibleFrameCount}
        selectedFrameIndex={selectedFrameIndex}
        onAddFiles={addPreparedFiles}
        onAssignAssetToFrame={handleAssignAssetToFrame}
        onAutoFillFrames={handleAutoFillFrames}
        onRemoveAsset={handleRemoveAsset}
        onClearAssets={handleClearAssets}
        onClose={() => setAssetTrayOpen(false)}
      />

      <StudioControls
        activeTheme={activeTheme}
        activeScene={activeScene}
        backgroundTone={backgroundTone}
        isTransparentBackdrop={isTransparentBackdrop}
        showBezel={showBezel}
        bezelFinish={bezelFinish}
        isLightSurface={isLightSurface}
        isCapturing={isCapturing}
        isMinimized={isMinimized}
        assetCount={assets.length}
        themeMenuOpen={themeMenuOpen}
        assetTrayOpen={assetTrayOpen}
        urlPopoverOpen={urlPopoverOpen}
        customUrl={customUrl}
        stageScaleTargetRef={stageContentRef}
        onToggleThemeMenu={handleToggleThemeMenu}
        onCloseThemeMenu={handleCloseThemeMenu}
        onSelectTheme={handleSelectTheme}
        onSelectScene={handleSelectScene}
        onToggleTransparentBackdrop={handleToggleTransparentBackdrop}
        onSelectBackgroundTone={handleSelectBackgroundTone}
        onToggleBezel={handleToggleBezel}
        onSelectBezelFinish={handleSelectBezelFinish}
        onToggleAssetTray={handleToggleAssetTray}
        onToggleUrlPopover={handleToggleUrlPopover}
        onCloseUrlPopover={handleCloseUrlPopover}
        onApplyCustomUrl={handleApplyCustomUrl}
        onClearCustomUrl={handleClearCustomUrl}
        onResetFrames={handleResetFrames}
        onReloadFrames={handleReloadFrames}
        onToggleMinimized={handleToggleMinimized}
      />

      {!isCapturing && isWindowDragOver && (
        <div className="pointer-events-none fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="rounded-2xl border border-white/25 bg-neutral-950/92 text-white px-6 py-4 shadow-2xl flex items-center gap-3">
            <Upload className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold">
              Drop screenshots to place onto your showcase
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
