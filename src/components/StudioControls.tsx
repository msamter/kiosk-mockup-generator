import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Grid2x2,
  Link2,
  Monitor,
  Paperclip,
  RotateCw,
  SlidersHorizontal,
  Smartphone,
  Square,
  Tablet,
  Watch,
} from 'lucide-react';
import {
  BACKGROUND_PRESETS,
  BEZEL_FINISH_LIST,
  BezelFinishId,
  SCENE_BUTTON_LABELS,
  SCENE_STAGE_LABELS,
  StudioPageId,
  StudioThemeId,
  THEME_SCENES,
} from '../types/studio';
import {
  loadPersistedScalePercent,
  savePersistedScalePercent,
} from '../utils/studioStorage';
import { StudioRangeSlider } from './StudioRangeSlider';
import { ThemeDropdown } from './ThemeDropdown';
import { UrlPopover } from './UrlPopover';

interface StageScaleControlProps {
  stageScaleTargetRef: React.RefObject<HTMLDivElement | null>;
  isLightSurface: boolean;
}

const StageScaleControl: React.FC<StageScaleControlProps> = React.memo(
  ({ stageScaleTargetRef, isLightSurface }) => {
    const [scalePercent, setScalePercent] = useState<number>(() => {
      const target = stageScaleTargetRef.current;
      if (target) {
        const inlineVal = target.style.getPropertyValue('--stage-user-scale');
        const parsed = parseFloat(inlineVal);
        if (Number.isFinite(parsed) && parsed > 0) {
          return Math.max(75, Math.min(110, Math.round(parsed * 100)));
        }
      }
      return loadPersistedScalePercent();
    });

    const rafIdRef = useRef<number | null>(null);
    const saveTimerRef = useRef<number | null>(null);
    const latestScaleRef = useRef<number>(scalePercent);
    const cleanupPointerRef = useRef<(() => void) | null>(null);

    const applyScaleCssVar = useCallback(
      (nextPercent: number) => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          const el = stageScaleTargetRef.current;
          if (el) {
            el.style.setProperty('--stage-user-scale', String(nextPercent / 100));
          }
        });
      },
      [stageScaleTargetRef]
    );

    useEffect(() => {
      const el = stageScaleTargetRef.current;
      if (el) {
        el.style.setProperty('--stage-user-scale', String(latestScaleRef.current / 100));
      }

      return () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        if (saveTimerRef.current !== null) {
          window.clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
          savePersistedScalePercent(latestScaleRef.current);
        }
        cleanupPointerRef.current?.();
        cleanupPointerRef.current = null;
        if (stageScaleTargetRef.current) {
          delete stageScaleTargetRef.current.dataset.scaling;
        }
      };
    }, [stageScaleTargetRef]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextPercent = Math.max(75, Math.min(110, Number(event.target.value)));
        latestScaleRef.current = nextPercent;
        setScalePercent(nextPercent);
        applyScaleCssVar(nextPercent);

        if (saveTimerRef.current !== null) {
          window.clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = window.setTimeout(() => {
          saveTimerRef.current = null;
          savePersistedScalePercent(nextPercent);
        }, 150);
      },
      [applyScaleCssVar]
    );

    const handlePointerDown = useCallback(() => {
      const el = stageScaleTargetRef.current;
      if (el) {
        el.dataset.scaling = 'true';
      }

      cleanupPointerRef.current?.();
      const finishScaling = () => {
        if (stageScaleTargetRef.current) {
          delete stageScaleTargetRef.current.dataset.scaling;
        }
        cleanupPointerRef.current = null;
      };

      const onEnd = () => finishScaling();
      window.addEventListener('pointerup', onEnd, { once: true });
      window.addEventListener('pointercancel', onEnd, { once: true });
      cleanupPointerRef.current = () => {
        window.removeEventListener('pointerup', onEnd);
        window.removeEventListener('pointercancel', onEnd);
      };
    }, [stageScaleTargetRef]);

    return (
      <div className="flex items-center gap-2 px-1.5 shrink-0">
        <span
          className={`text-[11px] font-medium shrink-0 ${
            isLightSurface ? 'text-neutral-500' : 'text-neutral-400'
          }`}
        >
          Scale
        </span>
        <StudioRangeSlider
          min={75}
          max={110}
          step={1}
          value={scalePercent}
          isLightSurface={isLightSurface}
          widthClassName="w-[76px]"
          ariaLabel="Stage zoom scale"
          ariaValueText={`${scalePercent}%`}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
        />
        <span
          className={`font-mono-tabular text-[11px] font-semibold w-[36px] text-right shrink-0 ${
            isLightSurface ? 'text-neutral-800' : 'text-neutral-200'
          }`}
        >
          {scalePercent}%
        </span>
      </div>
    );
  }
);

StageScaleControl.displayName = 'StageScaleControl';

interface StudioControlsProps {
  activeTheme: StudioThemeId;
  activeScene: StudioPageId;
  backgroundTone: number;
  isTransparentBackdrop: boolean;
  showBezel: boolean;
  bezelFinish: BezelFinishId;
  isLightSurface: boolean;
  isCapturing: boolean;
  isMinimized: boolean;
  assetCount: number;
  themeMenuOpen: boolean;
  assetTrayOpen: boolean;
  urlPopoverOpen: boolean;
  customUrl: string | null;
  stageScaleTargetRef: React.RefObject<HTMLDivElement | null>;
  onToggleThemeMenu: () => void;
  onCloseThemeMenu: () => void;
  onSelectTheme: (theme: StudioThemeId) => void;
  onSelectScene: (scene: StudioPageId) => void;
  onToggleTransparentBackdrop: () => void;
  onSelectBackgroundTone: (tone: number) => void;
  onToggleBezel: () => void;
  onSelectBezelFinish: (finish: BezelFinishId) => void;
  onToggleAssetTray: () => void;
  onToggleUrlPopover: () => void;
  onCloseUrlPopover: () => void;
  onApplyCustomUrl: (normalizedUrl: string, displayHost: string) => void;
  onClearCustomUrl: () => void;
  onResetFrames: () => void;
  onReloadFrames: () => void;
  onToggleMinimized: () => void;
}

export const StudioControls: React.FC<StudioControlsProps> = React.memo(
  ({
    activeTheme,
    activeScene,
    backgroundTone,
    isTransparentBackdrop,
    showBezel,
    bezelFinish,
    isLightSurface,
    isCapturing,
    isMinimized,
    assetCount,
    themeMenuOpen,
    assetTrayOpen,
    urlPopoverOpen,
    customUrl,
    stageScaleTargetRef,
    onToggleThemeMenu,
    onCloseThemeMenu,
    onSelectTheme,
    onSelectScene,
    onToggleTransparentBackdrop,
    onSelectBackgroundTone,
    onToggleBezel,
    onSelectBezelFinish,
    onToggleAssetTray,
    onToggleUrlPopover,
    onCloseUrlPopover,
    onApplyCustomUrl,
    onClearCustomUrl,
    onResetFrames,
    onReloadFrames,
    onToggleMinimized,
  }) => {
    const dockRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      const node = dockRef.current;
      if (!node || typeof ResizeObserver === 'undefined') return;

      const updateDockHeight = () => {
        const height = Math.round(node.getBoundingClientRect().height);
        if (height > 0) {
          document.documentElement.style.setProperty('--studio-dock-height', `${height}px`);
        }
      };

      updateDockHeight();
      const observer = new ResizeObserver(updateDockHeight);
      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    }, [isMinimized, isCapturing]);

    if (isCapturing) return null;

    const dockSurface = isLightSurface
      ? 'bg-white/90 border-black/12 text-neutral-900 shadow-[0_14px_40px_rgba(0,0,0,0.14)]'
      : 'bg-neutral-950/88 border-white/14 text-neutral-100 shadow-[0_18px_48px_rgba(0,0,0,0.62)]';

    const dividerClass = isLightSurface ? 'bg-black/10' : 'bg-white/12';

    const iconBtnBase =
      'relative inline-flex items-center justify-center min-w-[36px] h-9 px-2 rounded-full transition-[background-color,color,transform] duration-150 shrink-0 focus:outline-none focus-visible:ring-2';

    const iconBtnIdle = isLightSurface
      ? 'text-neutral-600 hover:text-neutral-950 hover:bg-black/6 focus-visible:ring-neutral-900/35'
      : 'text-neutral-400 hover:text-white hover:bg-white/10 focus-visible:ring-white/40';

    const iconBtnActive = isLightSurface
      ? 'bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900/45'
      : 'bg-white text-neutral-950 hover:bg-neutral-200 focus-visible:ring-white/50';

    const pillToggleBase =
      'inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-medium shrink-0 transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2';

    if (isMinimized) {
      return (
        <div
          ref={dockRef}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            type="button"
            onClick={onToggleMinimized}
            aria-label="Expand studio controls"
            title="Expand studio controls (M)"
            className={`inline-flex items-center gap-2 min-h-[44px] h-11 px-5 rounded-full border backdrop-blur-2xl text-xs font-semibold tracking-tight transition-[background-color,transform] duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 ${dockSurface} ${
              isLightSurface ? 'focus-visible:ring-neutral-900/35' : 'focus-visible:ring-white/45'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
            <span>Studio Controls</span>
            <ChevronUp className="w-3.5 h-3.5 shrink-0 opacity-75" aria-hidden="true" />
          </button>
        </div>
      );
    }

    const visibleThemeScenes = THEME_SCENES[activeTheme];

    return (
      <nav
        ref={dockRef}
        aria-label="Studio controls"
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-24px)] rounded-3xl xl:rounded-full border backdrop-blur-2xl px-3.5 py-1.5 ${dockSurface}`}
      >
        <div className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-x-2 gap-y-2">
          {/* 0. Far-left Styles dropdown */}
          <ThemeDropdown
            activeTheme={activeTheme}
            isOpen={themeMenuOpen}
            isLightSurface={isLightSurface}
            onToggleOpen={onToggleThemeMenu}
            onClose={onCloseThemeMenu}
            onSelectTheme={onSelectTheme}
          />

          <span aria-hidden="true" className={`hidden sm:block w-px h-5 shrink-0 ${dividerClass}`} />

          {/* 1. Style-filtered Scene selector */}
          <div className="flex items-center gap-1.5 px-1 shrink-0">
            <span
              className={`text-[11px] font-medium shrink-0 mr-0.5 ${
                isLightSurface ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            >
              Scene
            </span>
            <div className="flex items-center gap-0.5" role="group" aria-label="Scene layout">
              {visibleThemeScenes.map((scene, idx) => {
                const isSelected = activeScene === scene;
                const buttonLabel = SCENE_BUTTON_LABELS[scene];
                const isNumericLabel = /^\d+$/.test(buttonLabel);
                return (
                  <button
                    key={scene}
                    type="button"
                    onClick={() => onSelectScene(scene)}
                    aria-pressed={isSelected}
                    aria-label={SCENE_STAGE_LABELS[scene]}
                    title={`${SCENE_STAGE_LABELS[scene]} (key ${idx + 1})`}
                    className={`inline-flex items-center justify-center min-w-[28px] h-8 rounded-full text-xs font-semibold transition-[background-color,color,transform] duration-150 shrink-0 focus:outline-none focus-visible:ring-2 ${
                      isNumericLabel ? 'px-2 font-mono-tabular' : 'px-2.5 tracking-tight'
                    } ${isSelected ? iconBtnActive : iconBtnIdle}`}
                  >
                    {buttonLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <span aria-hidden="true" className={`hidden sm:block w-px h-5 shrink-0 ${dividerClass}`} />

          {/* 2. Backdrop toggle + 4 backdrop color circles */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleTransparentBackdrop}
              aria-pressed={isTransparentBackdrop}
              title={
                isTransparentBackdrop
                  ? 'Switch to solid studio backdrop'
                  : 'Switch to transparent PNG backdrop'
              }
              className={`${pillToggleBase} ${
                isTransparentBackdrop ? iconBtnActive : iconBtnIdle
              }`}
            >
              <Grid2x2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Backdrop</span>
            </button>

            <div className="flex items-center gap-1.5 px-1" role="group" aria-label="Backdrop color">
              {BACKGROUND_PRESETS.map((preset) => {
                const isSelected = !isTransparentBackdrop && backgroundTone === preset.tone;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onSelectBackgroundTone(preset.tone)}
                    aria-label={`Backdrop ${preset.label}`}
                    aria-pressed={isSelected}
                    title={`Backdrop: ${preset.label}`}
                    style={{
                      backgroundColor: preset.swatchColor,
                      boxShadow: `inset 0 0 0 1px ${preset.swatchRim}`,
                    }}
                    className={`w-5 h-5 rounded-full shrink-0 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 ${
                      isSelected
                        ? isLightSurface
                          ? 'ring-2 ring-neutral-900 ring-offset-2 ring-offset-white scale-105'
                          : 'ring-2 ring-white ring-offset-2 ring-offset-neutral-950 scale-105'
                        : isLightSurface
                          ? 'focus-visible:ring-neutral-900/45'
                          : 'focus-visible:ring-white/50'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <span aria-hidden="true" className={`hidden sm:block w-px h-5 shrink-0 ${dividerClass}`} />

          {/* 3. Bezel toggle + 3 bezel color circles */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleBezel}
              aria-pressed={showBezel}
              title={
                showBezel
                  ? 'Switch to frameless rounded display'
                  : activeTheme === 'terminal'
                    ? 'Show desktop hardware bezel'
                    : activeTheme === 'scribe'
                      ? 'Show tablet bezel'
                      : activeTheme === 'hourglass'
                        ? 'Show Pixel Watch case and crown'
                        : 'Show smartphone bezel'
              }
              className={`${pillToggleBase} ${showBezel ? iconBtnActive : iconBtnIdle}`}
            >
              {activeTheme === 'terminal' ? (
                <Monitor className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : activeTheme === 'scribe' ? (
                <Tablet className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : activeTheme === 'hourglass' ? (
                <Watch className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <Smartphone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>Bezel</span>
            </button>

            <div className="flex items-center gap-1.5 px-1" role="group" aria-label="Bezel finish">
              {BEZEL_FINISH_LIST.map((finish) => {
                const isSelected = showBezel && bezelFinish === finish.id;
                return (
                  <button
                    key={finish.id}
                    type="button"
                    onClick={() => onSelectBezelFinish(finish.id)}
                    aria-label={`Bezel ${finish.label}`}
                    aria-pressed={isSelected}
                    title={`Bezel: ${finish.label}`}
                    style={{
                      backgroundColor: finish.swatchColor,
                      boxShadow: `inset 0 0 0 1px ${finish.swatchRim}`,
                    }}
                    className={`w-5 h-5 rounded-full shrink-0 transition-transform duration-150 hover:scale-110 focus:outline-none focus-visible:ring-2 ${
                      isSelected
                        ? isLightSurface
                          ? 'ring-2 ring-neutral-900 ring-offset-2 ring-offset-white scale-105'
                          : 'ring-2 ring-white ring-offset-2 ring-offset-neutral-950 scale-105'
                        : isLightSurface
                          ? 'focus-visible:ring-neutral-900/45'
                          : 'focus-visible:ring-white/50'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <span aria-hidden="true" className={`hidden sm:block w-px h-5 shrink-0 ${dividerClass}`} />

          {/* 4. Stage utilities: Scale | Link2 (URL), Paperclip (Assets), Reset (Square), Reload (RotateCw), Minimize (ChevronDown) */}
          <div className="flex items-center gap-1 shrink-0">
            <StageScaleControl
              stageScaleTargetRef={stageScaleTargetRef}
              isLightSurface={isLightSurface}
            />

            <span aria-hidden="true" className={`w-px h-5 mx-1 shrink-0 ${dividerClass}`} />

            <div className="relative shrink-0">
              <button
                type="button"
                data-url-popover-trigger="true"
                onClick={onToggleUrlPopover}
                aria-expanded={urlPopoverOpen}
                aria-label="Add preview by URL"
                title={customUrl ? `Live URL active: ${customUrl}` : 'Preview a live website URL'}
                className={`${iconBtnBase} ${
                  urlPopoverOpen || customUrl ? iconBtnActive : iconBtnIdle
                }`}
              >
                <Link2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              </button>

              <UrlPopover
                isOpen={urlPopoverOpen}
                activeUrl={customUrl}
                isLightSurface={isLightSurface}
                onApplyUrl={onApplyCustomUrl}
                onClearUrl={onClearCustomUrl}
                onClose={onCloseUrlPopover}
              />
            </div>

            <button
              type="button"
              onClick={onToggleAssetTray}
              aria-pressed={assetTrayOpen}
              aria-label="Open screen assets panel"
              title="Upload and manage screen assets"
              className={`${iconBtnBase} ${assetTrayOpen ? iconBtnActive : iconBtnIdle}`}
            >
              <Paperclip className="w-4 h-4 shrink-0" aria-hidden="true" />
              {assetCount > 0 && (
                <span
                  className={`font-mono-tabular ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
                    assetTrayOpen
                      ? isLightSurface
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-900/15 text-neutral-950'
                      : isLightSurface
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-950'
                  }`}
                >
                  {assetCount}
                </span>
              )}
            </button>

            <span aria-hidden="true" className={`w-px h-5 mx-1 shrink-0 ${dividerClass}`} />

            <button
              type="button"
              onClick={onResetFrames}
              aria-label="Reset all frames to blank"
              title="Reset all frames to blank"
              className={`${iconBtnBase} ${iconBtnIdle}`}
            >
              <Square className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onReloadFrames}
              aria-label="Reload active frames"
              title="Reload active frames"
              className={`${iconBtnBase} ${iconBtnIdle}`}
            >
              <RotateCw className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onToggleMinimized}
              aria-label="Minimize studio controls"
              title="Minimize studio controls (M)"
              className={`${iconBtnBase} ${iconBtnIdle}`}
            >
              <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>
    );
  }
);

StudioControls.displayName = 'StudioControls';
