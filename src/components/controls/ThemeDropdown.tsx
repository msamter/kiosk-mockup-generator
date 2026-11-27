import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Camera,
  Check,
  ChevronUp,
  Compass,
  LayoutGrid,
  Monitor,
  Sparkles,
  Tablet,
  Watch,
  Waves,
} from 'lucide-react';
import { STUDIO_THEMES, StudioThemeId } from '../../types/studio';

interface ThemeDropdownProps {
  activeTheme: StudioThemeId;
  isOpen: boolean;
  isLightSurface: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  onSelectTheme: (theme: StudioThemeId) => void;
}

const renderThemeIcon = (themeId: StudioThemeId, className: string) => {
  switch (themeId) {
    case 'grid':
      return <LayoutGrid className={className} aria-hidden="true" />;
    case 'angles':
      return <Compass className={className} aria-hidden="true" />;
    case 'wave':
      return <Waves className={className} aria-hidden="true" />;
    case 'dynamic':
      return <Box className={className} aria-hidden="true" />;
    case 'terminal':
      return <Monitor className={className} aria-hidden="true" />;
    case 'scribe':
      return <Tablet className={className} aria-hidden="true" />;
    case 'hourglass':
      return <Watch className={className} aria-hidden="true" />;
    case 'live-action':
      return <Camera className={className} aria-hidden="true" />;
    default:
      return <Sparkles className={className} aria-hidden="true" />;
  }
};

export const ThemeDropdown: React.FC<ThemeDropdownProps> = React.memo(
  ({ activeTheme, isOpen, isLightSurface, onToggleOpen, onClose, onSelectTheme }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const restoreFocusRafRef = useRef<number | null>(null);
    const scrollIdleTimerRef = useRef<number | null>(null);
    const dragCleanupRef = useRef<(() => void) | null>(null);
    const [desktopLeftPx, setDesktopLeftPx] = useState<number>(16);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isDraggingThumb, setIsDraggingThumb] = useState(false);
    const [scrollThumb, setScrollThumb] = useState<{
      visible: boolean;
      heightPx: number;
      offsetPx: number;
      trackHeightPx: number;
    }>({ visible: false, heightPx: 32, offsetPx: 0, trackHeightPx: 0 });

    const updateScrollThumb = useCallback(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 2) {
        setScrollThumb((prev) =>
          prev.visible ? { visible: false, heightPx: 32, offsetPx: 0, trackHeightPx: 0 } : prev
        );
        return;
      }

      const trackHeightPx = Math.max(24, clientHeight - 28);
      const heightPx = Math.max(
        28,
        Math.min(trackHeightPx, Math.round((clientHeight / scrollHeight) * trackHeightPx))
      );
      const maxTravel = Math.max(0, trackHeightPx - heightPx);
      const offsetPx = (scrollTop / maxScroll) * maxTravel;

      setScrollThumb((prev) =>
        prev.visible &&
        prev.heightPx === heightPx &&
        prev.trackHeightPx === trackHeightPx &&
        Math.abs(prev.offsetPx - offsetPx) < 0.5
          ? prev
          : { visible: true, heightPx, offsetPx, trackHeightPx }
      );
    }, []);

    useEffect(() => {
      return () => {
        if (restoreFocusRafRef.current !== null) {
          cancelAnimationFrame(restoreFocusRafRef.current);
          restoreFocusRafRef.current = null;
        }
        if (scrollIdleTimerRef.current !== null) {
          window.clearTimeout(scrollIdleTimerRef.current);
          scrollIdleTimerRef.current = null;
        }
        dragCleanupRef.current?.();
        dragCleanupRef.current = null;
      };
    }, []);

    const syncMenuAnchor = useCallback(() => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const maxLeft = Math.max(12, window.innerWidth - 256);
      setDesktopLeftPx(Math.round(Math.max(12, Math.min(rect.left, maxLeft))));
    }, []);

    const closeAndRestoreFocus = useCallback(() => {
      onClose();
      if (restoreFocusRafRef.current !== null) {
        cancelAnimationFrame(restoreFocusRafRef.current);
      }
      restoreFocusRafRef.current = requestAnimationFrame(() => {
        restoreFocusRafRef.current = null;
        triggerRef.current?.focus();
      });
    }, [onClose]);

    useEffect(() => {
      if (!isOpen) {
        setIsScrolling(false);
        setIsDraggingThumb(false);
        dragCleanupRef.current?.();
        dragCleanupRef.current = null;
        return;
      }

      syncMenuAnchor();

      const activeIdx = Math.max(
        0,
        STUDIO_THEMES.findIndex((theme) => theme.id === activeTheme)
      );
      let thumbRafId = 0;
      const rafId = requestAnimationFrame(() => {
        itemRefs.current[activeIdx]?.focus();
        updateScrollThumb();
        thumbRafId = requestAnimationFrame(updateScrollThumb);
      });

      const scrollEl = scrollContainerRef.current;
      const resizeObserver =
        scrollEl && typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(() => updateScrollThumb())
          : null;
      if (scrollEl && resizeObserver) {
        resizeObserver.observe(scrollEl);
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeAndRestoreFocus();
          return;
        }

        const total = STUDIO_THEMES.length;
        const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement);
        const isTwoCol = window.innerWidth < 1280;

        if (event.key === 'Home') {
          event.preventDefault();
          itemRefs.current[0]?.focus();
          return;
        }

        if (event.key === 'End') {
          event.preventDefault();
          itemRefs.current[total - 1]?.focus();
          return;
        }

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          if (!isTwoCol) return;
          event.preventDefault();
          const delta = event.key === 'ArrowRight' ? 1 : -1;
          const base = currentIndex < 0 ? 0 : currentIndex;
          itemRefs.current[(base + delta + total) % total]?.focus();
          return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const step = isTwoCol ? 2 : 1;
          const delta = event.key === 'ArrowDown' ? step : -step;
          const base = currentIndex < 0 ? 0 : currentIndex;
          itemRefs.current[(base + delta + total) % total]?.focus();
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        const insideTrigger = containerRef.current?.contains(target) ?? false;
        const insideMenu = menuRef.current?.contains(target) ?? false;
        if (!insideTrigger && !insideMenu) {
          onClose();
        }
      };

      const handleViewportChange = () => {
        syncMenuAnchor();
        updateScrollThumb();
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', handleViewportChange, { passive: true });
      window.addEventListener('orientationchange', handleViewportChange, { passive: true });
      window.addEventListener('studio-dock-metrics', handleViewportChange, { passive: true });
      window.visualViewport?.addEventListener('resize', handleViewportChange, { passive: true });
      document.addEventListener('pointerdown', handlePointerDown);

      return () => {
        cancelAnimationFrame(rafId);
        cancelAnimationFrame(thumbRafId);
        resizeObserver?.disconnect();
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', handleViewportChange);
        window.removeEventListener('orientationchange', handleViewportChange);
        window.removeEventListener('studio-dock-metrics', handleViewportChange);
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [isOpen, activeTheme, closeAndRestoreFocus, onClose, syncMenuAnchor, updateScrollThumb]);

    const handleMenuScroll = useCallback(() => {
      updateScrollThumb();
      setIsScrolling(true);
      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
      scrollIdleTimerRef.current = window.setTimeout(() => {
        scrollIdleTimerRef.current = null;
        setIsScrolling(false);
      }, 650);
    }, [updateScrollThumb]);

    const handleThumbPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      const scrollEl = scrollContainerRef.current;
      if (!scrollEl) return;
      event.preventDefault();
      event.stopPropagation();

      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) return;

      const trackHeight = Math.max(24, scrollEl.clientHeight - 28);
      const thumbHeight = Math.max(
        28,
        Math.min(trackHeight, Math.round((scrollEl.clientHeight / scrollEl.scrollHeight) * trackHeight))
      );
      const maxTravel = Math.max(1, trackHeight - thumbHeight);
      const startY = event.clientY;
      const startScrollTop = scrollEl.scrollTop;

      dragCleanupRef.current?.();
      setIsDraggingThumb(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const nextScrollTop = startScrollTop + (deltaY / maxTravel) * maxScroll;
        scrollEl.scrollTop = Math.max(0, Math.min(maxScroll, nextScrollTop));
      };

      const finishDrag = () => {
        setIsDraggingThumb(false);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', finishDrag);
        window.removeEventListener('pointercancel', finishDrag);
        dragCleanupRef.current = null;
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', finishDrag, { once: true });
      window.addEventListener('pointercancel', finishDrag, { once: true });
      dragCleanupRef.current = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', finishDrag);
        window.removeEventListener('pointercancel', finishDrag);
      };
    }, []);

    const handleTrackPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      const scrollEl = scrollContainerRef.current;
      if (!scrollEl) return;
      event.preventDefault();
      event.stopPropagation();

      const rect = event.currentTarget.getBoundingClientRect();
      const clickRatio = Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height)));
      const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scrollEl.scrollTo({
        top: clickRatio * maxScroll,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }, []);

    const activeConfig =
      STUDIO_THEMES.find((theme) => theme.id === activeTheme) ?? STUDIO_THEMES[0];

    // Material 3 Expressive trigger: full pill shape at rest and when expanded
    const triggerClasses = isOpen
      ? isLightSurface
        ? 'rounded-full bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.16)]'
        : 'rounded-full bg-white text-neutral-950 hover:bg-neutral-200 shadow-[0_4px_16px_rgba(0,0,0,0.42)]'
      : isLightSurface
        ? 'rounded-full bg-black/[0.06] text-neutral-900 hover:bg-black/[0.11]'
        : 'rounded-full bg-white/[0.09] text-neutral-100 hover:bg-white/[0.15]';

    const menuSurface = isLightSurface
      ? 'bg-[#f8f8fa]/96 border-black/10 text-neutral-900 shadow-[0_20px_56px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.06)]'
      : 'bg-[#1c1c20]/96 border-white/12 text-neutral-100 shadow-[0_24px_64px_rgba(0,0,0,0.72),0_4px_16px_rgba(0,0,0,0.4)]';

    const itemIdle = isLightSurface
      ? 'rounded-[16px] text-neutral-700 hover:bg-black/[0.06] hover:text-neutral-950 focus-visible:bg-black/[0.06]'
      : 'rounded-[16px] text-neutral-300 hover:bg-white/[0.09] hover:text-white focus-visible:bg-white/[0.09]';

    // Material 3 Expressive active menu row: morphs into full pill container with high-contrast emphasis
    const itemActive = isLightSurface
      ? 'rounded-full bg-neutral-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.14)]'
      : 'rounded-full bg-white text-neutral-950 shadow-[0_4px_14px_rgba(0,0,0,0.45)]';

    const thumbActive = isScrolling || isDraggingThumb;
    const scrollbarTrackBg = isLightSurface ? 'bg-black/[0.06]' : 'bg-white/[0.08]';
    const scrollbarThumbBg = isLightSurface
      ? thumbActive
        ? 'bg-neutral-900/75'
        : 'bg-neutral-900/32 hover:bg-neutral-900/52'
      : thumbActive
        ? 'bg-white/80'
        : 'bg-white/32 hover:bg-white/55';

    const menuContent = isOpen ? (
      <div
        id="studio-styles-menu"
        ref={menuRef}
        role="menu"
        aria-label="Style options"
        style={
          {
            bottom:
              'max(calc(80px + env(safe-area-inset-bottom, 0px)), calc(var(--studio-dock-top-offset, 84px) + 12px))',
            '--styles-menu-left': `${desktopLeftPx}px`,
          } as React.CSSProperties
        }
        className={`m3-menu-enter origin-bottom xl:origin-bottom-left fixed z-[55] inset-x-0 mx-auto xl:inset-x-auto xl:mx-0 xl:left-[var(--styles-menu-left)] w-[min(94vw,440px)] xl:w-[244px] overflow-hidden rounded-[24px] border backdrop-blur-2xl ${menuSurface}`}
      >
        <div
          ref={scrollContainerRef}
          onScroll={handleMenuScroll}
          className={`max-h-[min(55dvh,var(--studio-dock-available-above,320px),320px)] sm:max-h-[min(60dvh,var(--studio-dock-available-above,340px),340px)] xl:max-h-[min(72dvh,var(--studio-dock-available-above,540px),540px)] overflow-y-auto overscroll-contain no-scrollbar p-2 ${
            scrollThumb.visible ? 'pr-4.5' : ''
          } grid grid-cols-2 gap-1.5 xl:flex xl:flex-col xl:gap-1`}
        >
          {STUDIO_THEMES.map((theme, idx) => {
            const isSelected = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onSelectTheme(theme.id);
                  closeAndRestoreFocus();
                }}
                className={`w-full min-h-[48px] px-2.5 sm:px-3 py-2 flex items-center justify-between gap-2 text-left m3-spring transition-[border-radius,background-color,color,transform] duration-200 active:scale-[0.97] studio-focus-ring ${
                  isSelected ? itemActive : itemIdle
                }`}
              >
                <span className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shrink-0 transition-colors duration-150 ${
                      isSelected
                        ? isLightSurface
                          ? 'bg-white/16 text-white'
                          : 'bg-neutral-950/12 text-neutral-950'
                        : isLightSurface
                          ? 'bg-black/[0.05] text-neutral-700'
                          : 'bg-white/[0.07] text-neutral-300'
                    }`}
                  >
                    {renderThemeIcon(theme.id, 'w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0')}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="text-[12px] sm:text-[12.5px] font-semibold leading-tight tracking-tight truncate">
                      {theme.label}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[10.5px] leading-tight truncate mt-0.5 ${
                        isSelected
                          ? isLightSurface
                            ? 'text-white/75'
                            : 'text-neutral-950/70'
                          : isLightSurface
                            ? 'text-neutral-500'
                            : 'text-neutral-400'
                      }`}
                    >
                      {theme.description}
                    </span>
                  </span>
                </span>

                {isSelected && (
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0 ${
                      isLightSurface ? 'bg-white/18 text-white' : 'bg-neutral-950/12 text-neutral-950'
                    }`}
                  >
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Google 2026 Material 3 Expressive floating pill scrollbar */}
        {scrollThumb.visible && (
          <div
            aria-hidden="true"
            onPointerDown={handleTrackPointerDown}
            className="absolute right-1.5 top-[14px] bottom-[14px] w-3 flex justify-center cursor-pointer touch-none"
          >
            <div className={`pointer-events-none relative h-full w-[4px] rounded-full ${scrollbarTrackBg}`}>
              <div
                onPointerDown={handleThumbPointerDown}
                style={{
                  height: `${scrollThumb.heightPx}px`,
                  transform: `translate3d(-50%, ${scrollThumb.offsetPx}px, 0) scaleX(${
                    thumbActive ? 1.5 : 1
                  })`,
                }}
                className={`pointer-events-auto absolute left-1/2 top-0 w-[4px] rounded-full m3-spring transition-[transform,background-color] duration-200 ${scrollbarThumbBg}`}
              />
            </div>
          </div>
        )}
      </div>
    ) : null;

    return (
      <div ref={containerRef} className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={onToggleOpen}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls="studio-styles-menu"
          aria-label={`Styles: ${activeConfig.label}`}
          title={`Switch style (Current: ${activeConfig.label})`}
          className={`inline-flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] h-11 px-3.5 text-xs font-semibold tracking-tight whitespace-nowrap shrink-0 m3-spring transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.96] studio-focus-ring ${triggerClasses}`}
        >
          {renderThemeIcon(activeConfig.id, 'w-3.5 h-3.5 shrink-0 opacity-90')}
          <span className="shrink-0 whitespace-nowrap">Styles</span>
          <span
            className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
              isOpen
                ? isLightSurface
                  ? 'bg-white/16 text-white'
                  : 'bg-neutral-950/12 text-neutral-950'
                : isLightSurface
                  ? 'bg-black/[0.07] text-neutral-700'
                  : 'bg-white/[0.11] text-neutral-200'
            }`}
          >
            {activeConfig.label}
          </span>
          <ChevronUp
            className={`w-3.5 h-3.5 shrink-0 opacity-80 m3-spring transition-transform duration-250 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {typeof document !== 'undefined' && menuContent
          ? createPortal(menuContent, document.body)
          : menuContent}
      </div>
    );
  }
);

ThemeDropdown.displayName = 'ThemeDropdown';
