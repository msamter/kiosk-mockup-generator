import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  Grid2x2,
  Link2,
  Monitor,
  Paperclip,
  RotateCw,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Watch,
} from 'lucide-react';
import {
  BACKGROUND_PRESETS,
  BEZEL_FINISH_LIST,
  BezelFinishId,
  HOURGLASS_SCENE_LAYOUTS,
  HourglassSceneId,
  SCENE_BUTTON_LABELS,
  SCENE_STAGE_LABELS,
  StudioPageId,
  StudioThemeId,
  THEME_SCENES,
} from '../../types/studio';
import {
  loadPersistedScalePercent,
  savePersistedScalePercent,
} from '../../utils/studioStorage';
import { StudioRangeSlider } from './StudioRangeSlider';
import { ThemeDropdown } from './ThemeDropdown';
import { UrlPopover } from './UrlPopover';

interface StageScaleControlProps {
  stageScaleTargetRef: React.RefObject<HTMLDivElement | null>;
  isLightSurface: boolean;
  scaleResetNonce: number;
}

const StageScaleControl: React.FC<StageScaleControlProps> = React.memo(
  ({ stageScaleTargetRef, isLightSurface, scaleResetNonce }) => {
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

    useEffect(() => {
      if (scaleResetNonce === 0) return;
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      latestScaleRef.current = 100;
      setScalePercent(100);
      applyScaleCssVar(100);
      savePersistedScalePercent(100);
    }, [scaleResetNonce, applyScaleCssVar]);

    const handleChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const parsed = Number(event.target.value);
        if (!Number.isFinite(parsed)) return;
        const nextPercent = Math.max(75, Math.min(110, Math.round(parsed)));
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
      <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-2.5 pr-1.5 sm:pr-2 shrink-0">
        <span
          className={`text-[11px] font-semibold tracking-tight whitespace-nowrap shrink-0 ${
            isLightSurface ? 'text-neutral-600' : 'text-neutral-400'
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
          widthClassName="w-[74px] sm:w-[88px]"
          ariaLabel="Stage zoom scale"
          ariaValueText={`${scalePercent}%`}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
        />
        <span
          aria-hidden="true"
          className={`font-mono-tabular tabular-nums text-[11px] font-semibold w-11 min-w-[44px] text-right whitespace-nowrap shrink-0 select-none ${
            isLightSurface ? 'text-neutral-900' : 'text-neutral-100'
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
  scaleResetNonce: number;
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
    scaleResetNonce,
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
    const dockRef = useRef<HTMLElement | null>(null);
    const setDockElement = useCallback((node: HTMLElement | null) => {
      dockRef.current = node;
    }, []);

    useEffect(() => {
      const node = dockRef.current;
      if (!node) return;

      let rafId = 0;
      let lastHeight = -1;
      let lastTopOffset = -1;
      let lastAvailableAbove = -1;

      const updateDockMetrics = () => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = node.getBoundingClientRect();
          const height = Math.round(rect.height);
          if (height > 0) {
            const rootStyle = document.documentElement.style;
            const layoutHeight = window.innerHeight || document.documentElement.clientHeight || height;
            const vvTop = window.visualViewport ? Math.max(0, window.visualViewport.offsetTop) : 0;
            const topOffsetFromBottom = Math.max(height, Math.round(layoutHeight - rect.top));
            const availableAbove = Math.max(150, Math.round(rect.top - (vvTop + 72)));

            if (height !== lastHeight) {
              lastHeight = height;
              rootStyle.setProperty('--studio-dock-height', `${height}px`);
            }
            if (topOffsetFromBottom !== lastTopOffset) {
              lastTopOffset = topOffsetFromBottom;
              rootStyle.setProperty('--studio-dock-top-offset', `${topOffsetFromBottom}px`);
              window.dispatchEvent(new Event('studio-dock-metrics'));
            }
            if (availableAbove !== lastAvailableAbove) {
              lastAvailableAbove = availableAbove;
              rootStyle.setProperty('--studio-dock-available-above', `${availableAbove}px`);
            }
          }
        });
      };

      updateDockMetrics();
      const observer =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateDockMetrics) : null;
      observer?.observe(node);
      observer?.observe(document.documentElement);
      node.addEventListener('animationend', updateDockMetrics);
      window.addEventListener('resize', updateDockMetrics, { passive: true });
      window.addEventListener('orientationchange', updateDockMetrics, { passive: true });
      window.visualViewport?.addEventListener('resize', updateDockMetrics, { passive: true });
      window.visualViewport?.addEventListener('scroll', updateDockMetrics, { passive: true });

      return () => {
        cancelAnimationFrame(rafId);
        observer?.disconnect();
        node.removeEventListener('animationend', updateDockMetrics);
        window.removeEventListener('resize', updateDockMetrics);
        window.removeEventListener('orientationchange', updateDockMetrics);
        window.visualViewport?.removeEventListener('resize', updateDockMetrics);
        window.visualViewport?.removeEventListener('scroll', updateDockMetrics);
      };
    }, [isMinimized, isCapturing]);

    if (isCapturing) return null;

    // Material 3 Expressive Floating Toolbar Surface Container
    const dockSurface = isLightSurface
      ? 'bg-[#f4f4f6]/92 border-black/10 text-neutral-900 shadow-[0_16px_44px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)]'
      : 'bg-[#1a1a1e]/92 border-white/12 text-neutral-100 shadow-[0_20px_56px_rgba(0,0,0,0.68),0_2px_10px_rgba(0,0,0,0.4)]';

    // Material 3 Expressive Tonal Group Container (sub-surface capsule inside toolbar)
    const tonalGroupSurface = isLightSurface
      ? 'bg-black/[0.045] ring-1 ring-inset ring-black/[0.05]'
      : 'bg-white/[0.055] ring-1 ring-inset ring-white/[0.06]';

    const dividerClass = isLightSurface ? 'bg-black/10' : 'bg-white/12';

    // Material 3 Expressive Icon Button: >=44x44px tap target, fully rounded pill/circle
    const iconBtnBase =
      'group/action relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] h-11 px-2.5 rounded-full m3-spring transition-[background-color,color,transform,box-shadow] duration-200 shrink-0 active:scale-[0.93] studio-focus-ring';

    const iconBtnIdle = isLightSurface
      ? 'text-neutral-700 hover:text-neutral-950 hover:bg-black/[0.07]'
      : 'text-neutral-300 hover:text-white hover:bg-white/[0.11]';

    const iconBtnActive = isLightSurface
      ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_3px_10px_rgba(0,0,0,0.16)]'
      : 'bg-white text-neutral-950 hover:bg-neutral-200 shadow-[0_3px_12px_rgba(0,0,0,0.42)]';

    // Crisp Material 3 Expressive hover (fine-pointer only) & keyboard-focus tooltip for trailing icon actions
    const actionTooltipBase = `studio-action-tooltip pointer-events-none absolute bottom-full mb-2.5 z-50 px-2.5 py-1.5 rounded-full text-[11px] font-semibold leading-none tracking-tight whitespace-nowrap m3-spring transition-[opacity,transform] duration-150 ${
      isLightSurface
        ? 'bg-neutral-900 text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)]'
        : 'bg-white text-neutral-950 shadow-[0_6px_20px_rgba(0,0,0,0.5)]'
    }`;

    // Material 3 Expressive Toggle Pill: fully rounded pill with >=44px hit height via expanded touch area
    const toggleBtnBase =
      "relative before:content-[''] before:absolute before:-inset-y-1.5 before:-inset-x-0.5 inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap shrink-0 m3-spring transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.95] studio-focus-ring";

    const toggleBtnIdle = isLightSurface
      ? 'text-neutral-700 hover:text-neutral-950 hover:bg-black/[0.07]'
      : 'text-neutral-300 hover:text-white hover:bg-white/[0.11]';

    const toggleBtnActive = isLightSurface
      ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_2px_8px_rgba(0,0,0,0.16)]'
      : 'bg-white text-neutral-950 hover:bg-neutral-200 shadow-[0_2px_10px_rgba(0,0,0,0.42)]';

    if (isMinimized) {
      return (
        <div
          style={{
            paddingBottom:
              'calc(env(safe-area-inset-bottom, 0px) + var(--app-viewport-bottom-offset, 0px))',
          }}
          className="pointer-events-none fixed inset-x-0 bottom-3 sm:bottom-4 lg:bottom-5 z-50 flex justify-center px-2 sm:px-4"
        >
          <button
            ref={setDockElement}
            type="button"
            onClick={onToggleMinimized}
            aria-label="Expand tools"
            title="Expand tools (M)"
            className={`pointer-events-auto m3-dock-enter inline-flex items-center gap-2.5 max-w-[96vw] min-h-[48px] h-12 px-6 rounded-full border backdrop-blur-2xl text-xs font-semibold tracking-tight whitespace-nowrap m3-spring transition-[border-radius,background-color,transform,box-shadow] duration-200 hover:scale-[1.02] active:scale-[0.96] active:rounded-[16px] studio-focus-ring ${dockSurface}`}
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0 opacity-85" aria-hidden="true" />
            <span>Tools</span>
            <ChevronUp className="w-4 h-4 shrink-0 opacity-75" aria-hidden="true" />
          </button>
        </div>
      );
    }

    const visibleThemeScenes = THEME_SCENES[activeTheme];
    const isCompactSceneList = visibleThemeScenes.length > 10;

    // Material 3 Expressive Connected Button Group segment
    const renderConnectedSceneButton = (
      scene: StudioPageId,
      globalIdx: number,
      groupIdx: number,
      groupLength: number
    ) => {
      const isSelected = activeScene === scene;
      const buttonLabel = SCENE_BUTTON_LABELS[scene];
      const isNumericLabel = /^\d+$/.test(buttonLabel);
      const shortcutHint = globalIdx < 9 ? ` (key ${globalIdx + 1})` : '';

      const isFirst = groupIdx === 0;
      const isLast = groupIdx === groupLength - 1;
      const connectedRadius = isSelected
        ? 'rounded-full'
        : isFirst && isLast
          ? 'rounded-full'
          : isFirst
            ? 'rounded-l-full rounded-r-[7px]'
            : isLast
              ? 'rounded-r-full rounded-l-[7px]'
              : 'rounded-[7px]';

      const segmentSurface = isSelected
        ? isLightSurface
          ? 'bg-neutral-900 text-white shadow-[0_2px_8px_rgba(0,0,0,0.18)]'
          : 'bg-white text-neutral-950 shadow-[0_2px_10px_rgba(0,0,0,0.45)]'
        : isLightSurface
          ? 'bg-black/[0.045] text-neutral-700 hover:bg-black/[0.095] hover:text-neutral-950'
          : 'bg-white/[0.065] text-neutral-300 hover:bg-white/[0.13] hover:text-white';

      return (
        <button
          key={scene}
          type="button"
          onClick={() => onSelectScene(scene)}
          aria-pressed={isSelected}
          aria-label={SCENE_STAGE_LABELS[scene]}
          title={`${SCENE_STAGE_LABELS[scene]}${shortcutHint}`}
          className={`relative before:content-[''] before:absolute before:-inset-y-1.5 before:-inset-x-0.5 inline-flex items-center justify-center h-8 text-xs font-semibold shrink-0 m3-spring transition-[border-radius,background-color,color,transform,padding,box-shadow] duration-200 active:scale-[0.93] studio-focus-ring ${connectedRadius} ${
            isCompactSceneList
              ? isNumericLabel
                ? isSelected
                  ? 'min-w-[30px] px-2 font-mono-tabular tabular-nums'
                  : 'min-w-[26px] px-1.5 font-mono-tabular tabular-nums'
                : 'min-w-[28px] px-2 tracking-tight'
              : isNumericLabel
                ? isSelected
                  ? 'min-w-[32px] px-2.5 font-mono-tabular tabular-nums'
                  : 'min-w-[28px] px-2 font-mono-tabular tabular-nums'
                : isSelected
                  ? 'min-w-[32px] px-3 tracking-tight'
                  : 'min-w-[28px] px-2.5 tracking-tight'
          } ${segmentSurface}`}
        >
          {buttonLabel}
        </button>
      );
    };

    const pixelWatchScenes =
      activeTheme === 'hourglass'
        ? visibleThemeScenes.filter(
            (scene) => HOURGLASS_SCENE_LAYOUTS[scene as HourglassSceneId]?.model === 'pixel'
          )
        : [];
    const appleWatchScenes =
      activeTheme === 'hourglass'
        ? visibleThemeScenes.filter(
            (scene) => HOURGLASS_SCENE_LAYOUTS[scene as HourglassSceneId]?.model === 'apple'
          )
        : [];

    return (
      <div
        style={{
          paddingBottom:
            'calc(env(safe-area-inset-bottom, 0px) + var(--app-viewport-bottom-offset, 0px))',
        }}
        className="pointer-events-none fixed inset-x-0 bottom-3 sm:bottom-4 lg:bottom-5 z-50 flex justify-center px-2 sm:px-3 lg:px-4"
      >
        <nav
          ref={setDockElement}
          aria-label="Studio controls"
          className={`relative pointer-events-auto m3-dock-enter w-fit max-w-[96vw] rounded-[24px] lg:rounded-[28px] border backdrop-blur-2xl p-1.5 lg:p-2 ${dockSurface}`}
        >
          <UrlPopover
            isOpen={urlPopoverOpen}
            activeUrl={customUrl}
            isLightSurface={isLightSurface}
            onApplyUrl={onApplyCustomUrl}
            onClearUrl={onClearCustomUrl}
            onClose={onCloseUrlPopover}
          />
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 lg:gap-2">
          {/* 0. Far-left Material 3 Expressive Styles Dropdown */}
          <ThemeDropdown
            activeTheme={activeTheme}
            isOpen={themeMenuOpen}
            isLightSurface={isLightSurface}
            onToggleOpen={onToggleThemeMenu}
            onClose={onCloseThemeMenu}
            onSelectTheme={onSelectTheme}
          />

          {/* 1. Material 3 Expressive Connected Scene Button Group */}
          <div
            className={`flex items-center gap-2 min-h-[44px] py-1.5 pl-3 pr-1.5 rounded-[22px] max-w-full ${tonalGroupSurface}`}
          >
            <span
              className={`text-[11px] font-semibold tracking-tight whitespace-nowrap shrink-0 ${
                isLightSurface ? 'text-neutral-600' : 'text-neutral-400'
              }`}
            >
              Scene
            </span>
            {activeTheme === 'hourglass' ? (
              <div
                className="flex flex-wrap items-center justify-center gap-2"
                role="group"
                aria-label="Scene layout"
              >
                <span
                  className={`text-[11px] font-semibold shrink-0 ${
                    isLightSurface ? 'text-neutral-800' : 'text-neutral-200'
                  }`}
                >
                  Pixel
                </span>
                <div
                  className="flex items-center gap-[3px]"
                  role="group"
                  aria-label="Pixel Watch layouts"
                >
                  {pixelWatchScenes.map((scene, idx) =>
                    renderConnectedSceneButton(
                      scene,
                      visibleThemeScenes.indexOf(scene),
                      idx,
                      pixelWatchScenes.length
                    )
                  )}
                </div>

                <span aria-hidden="true" className={`w-px h-4 shrink-0 ${dividerClass}`} />

                <span
                  className={`text-[11px] font-semibold shrink-0 ${
                    isLightSurface ? 'text-neutral-800' : 'text-neutral-200'
                  }`}
                >
                  Apple
                </span>
                <div
                  className="flex items-center gap-[3px]"
                  role="group"
                  aria-label="Apple Watch layouts"
                >
                  {appleWatchScenes.map((scene, idx) =>
                    renderConnectedSceneButton(
                      scene,
                      visibleThemeScenes.indexOf(scene),
                      idx,
                      appleWatchScenes.length
                    )
                  )}
                </div>
              </div>
            ) : (
              <div
                className="flex flex-wrap items-center justify-center gap-[3px]"
                role="group"
                aria-label="Scene layout"
              >
                {visibleThemeScenes.map((scene, idx) =>
                  renderConnectedSceneButton(scene, idx, idx, visibleThemeScenes.length)
                )}
              </div>
            )}
          </div>

          {/* 2. Material 3 Expressive Backdrop Toggle + Tactile Color Selector */}
          <div
            className={`flex items-center gap-1.5 min-h-[44px] h-11 p-1.5 pr-2.5 rounded-full shrink-0 ${tonalGroupSurface}`}
          >
            <button
              type="button"
              onClick={onToggleTransparentBackdrop}
              aria-pressed={isTransparentBackdrop}
              title={
                isTransparentBackdrop
                  ? 'Switch to solid studio backdrop'
                  : 'Switch to transparent PNG backdrop'
              }
              className={`${toggleBtnBase} ${
                isTransparentBackdrop ? toggleBtnActive : toggleBtnIdle
              }`}
            >
              <Grid2x2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Backdrop</span>
            </button>

            <div className="flex items-center gap-1.5 pl-0.5" role="group" aria-label="Backdrop color">
              {BACKGROUND_PRESETS.map((preset) => {
                const isSelected = !isTransparentBackdrop && backgroundTone === preset.tone;
                const isLightSwatch = preset.tone >= 55;
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
                    className={`relative before:content-[''] before:absolute before:-inset-[10px] inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 m3-spring transition-[transform,box-shadow] duration-200 hover:scale-110 active:scale-90 studio-focus-ring ${
                      isSelected
                        ? isLightSurface
                          ? 'scale-105 ring-2 ring-neutral-900 ring-offset-2 ring-offset-[#f4f4f6]'
                          : 'scale-105 ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1e]'
                        : ''
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3 h-3 shrink-0 stroke-[3] ${
                          isLightSwatch ? 'text-neutral-950' : 'text-white'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Material 3 Expressive Bezel Toggle + Tactile Finish Color Selector */}
          <div
            className={`flex items-center gap-1.5 min-h-[44px] h-11 p-1.5 pr-2.5 rounded-full shrink-0 ${tonalGroupSurface}`}
          >
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
                        ? 'Show watch case and crown'
                        : 'Show smartphone bezel'
              }
              className={`${toggleBtnBase} ${showBezel ? toggleBtnActive : toggleBtnIdle}`}
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

            <div className="flex items-center gap-1.5 pl-0.5" role="group" aria-label="Bezel finish">
              {BEZEL_FINISH_LIST.map((finish) => {
                const isSelected = showBezel && bezelFinish === finish.id;
                const isLightSwatch = finish.id === 'silver';
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
                    className={`relative before:content-[''] before:absolute before:-inset-[10px] inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 m3-spring transition-[transform,box-shadow] duration-200 hover:scale-110 active:scale-90 studio-focus-ring ${
                      isSelected
                        ? isLightSurface
                          ? 'scale-105 ring-2 ring-neutral-900 ring-offset-2 ring-offset-[#f4f4f6]'
                          : 'scale-105 ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1e]'
                        : ''
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3 h-3 shrink-0 stroke-[3] ${
                          isLightSwatch ? 'text-neutral-950' : 'text-white'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Material 3 Expressive Scale Slider + Action Utilities */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
            <div className={`flex items-center min-h-[44px] h-11 px-1 rounded-full shrink-0 ${tonalGroupSurface}`}>
              <StageScaleControl
                stageScaleTargetRef={stageScaleTargetRef}
                isLightSurface={isLightSurface}
                scaleResetNonce={scaleResetNonce}
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span aria-hidden="true" className={`w-px h-5 mx-0.5 shrink-0 ${dividerClass}`} />

              <div className="relative shrink-0">
                <button
                  type="button"
                  data-url-popover-trigger="true"
                  onClick={onToggleUrlPopover}
                  aria-expanded={urlPopoverOpen}
                  aria-controls="studio-url-popover"
                  aria-label={
                    customUrl ? `Preview live URL (active: ${customUrl})` : 'Preview live website URL'
                  }
                  className={`${iconBtnBase} ${
                    urlPopoverOpen || customUrl ? iconBtnActive : iconBtnIdle
                  }`}
                >
                  <Link2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {!urlPopoverOpen && (
                    <span
                      role="tooltip"
                      className={`${actionTooltipBase} left-1/2 -translate-x-1/2`}
                    >
                      {customUrl ? 'Live URL active' : 'Preview URL'}
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                data-asset-tray-trigger="true"
                onClick={onToggleAssetTray}
                aria-expanded={assetTrayOpen}
                aria-controls="studio-asset-tray"
                aria-label={
                  assetCount > 0
                    ? `Screen attachments (${assetCount} uploaded)`
                    : 'Screen attachments'
                }
                className={`${iconBtnBase} ${assetTrayOpen ? iconBtnActive : iconBtnIdle}`}
              >
                <Paperclip className="w-4 h-4 shrink-0" aria-hidden="true" />
                {assetCount > 0 && (
                  <span
                    className={`font-mono-tabular tabular-nums ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none shrink-0 ${
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
                <span
                  role="tooltip"
                  className={`${actionTooltipBase} left-1/2 -translate-x-1/2`}
                >
                  {assetCount > 0 ? `Attachments (${assetCount})` : 'Attachments'}
                </span>
              </button>

              <span aria-hidden="true" className={`w-px h-5 mx-0.5 shrink-0 ${dividerClass}`} />

              <button
                type="button"
                onClick={onResetFrames}
                aria-label="Reset all frames to blank"
                className={`${iconBtnBase} ${iconBtnIdle}`}
              >
                <Ban className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span
                  role="tooltip"
                  className={`${actionTooltipBase} left-1/2 -translate-x-1/2`}
                >
                  Reset frames
                </span>
              </button>

              <button
                type="button"
                onClick={onReloadFrames}
                aria-label="Reload active frames"
                className={`${iconBtnBase} ${iconBtnIdle}`}
              >
                <RotateCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span
                  role="tooltip"
                  className={`${actionTooltipBase} left-1/2 -translate-x-1/2`}
                >
                  Reload frames
                </span>
              </button>

              <button
                type="button"
                onClick={onToggleMinimized}
                aria-label="Minimize tools"
                className={`${iconBtnBase} ${iconBtnIdle}`}
              >
                <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span
                  role="tooltip"
                  className={`${actionTooltipBase} right-0`}
                >
                  Minimize (M)
                </span>
              </button>
            </div>
          </div>
          </div>
        </nav>
      </div>
    );
  }
);

StudioControls.displayName = 'StudioControls';
