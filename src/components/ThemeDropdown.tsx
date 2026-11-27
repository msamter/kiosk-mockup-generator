import React, { useCallback, useEffect, useRef } from 'react';
import { Check, ChevronUp, Compass, LayoutGrid, Monitor, Sparkles, Tablet, Watch } from 'lucide-react';
import { STUDIO_THEMES, StudioThemeId } from '../types/studio';

interface ThemeDropdownProps {
  activeTheme: StudioThemeId;
  isOpen: boolean;
  isLightSurface: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  onSelectTheme: (theme: StudioThemeId) => void;
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = React.memo(
  ({ activeTheme, isOpen, isLightSurface, onToggleOpen, onClose, onSelectTheme }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const closeAndRestoreFocus = useCallback(() => {
      onClose();
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }, [onClose]);

    useEffect(() => {
      if (!isOpen) return;

      const activeIdx = Math.max(
        0,
        STUDIO_THEMES.findIndex((theme) => theme.id === activeTheme)
      );
      const rafId = requestAnimationFrame(() => {
        itemRefs.current[activeIdx]?.focus();
      });

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          closeAndRestoreFocus();
          return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const currentIndex = itemRefs.current.findIndex((el) => el === document.activeElement);
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          const nextIndex =
            (currentIndex + delta + STUDIO_THEMES.length) % STUDIO_THEMES.length;
          itemRefs.current[nextIndex]?.focus();
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (target && containerRef.current && !containerRef.current.contains(target)) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('pointerdown', handlePointerDown);

      return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [isOpen, activeTheme, closeAndRestoreFocus, onClose]);

    const activeConfig =
      STUDIO_THEMES.find((theme) => theme.id === activeTheme) ?? STUDIO_THEMES[0];

    const triggerClasses = isOpen
      ? isLightSurface
        ? 'bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900/45'
        : 'bg-white text-neutral-950 hover:bg-neutral-200 focus-visible:ring-white/50'
      : isLightSurface
        ? 'text-neutral-800 hover:bg-black/6 focus-visible:ring-neutral-900/35'
        : 'text-neutral-100 hover:bg-white/10 focus-visible:ring-white/40';

    const menuSurface = isLightSurface
      ? 'bg-white/95 border-black/12 text-neutral-900 shadow-[0_18px_48px_rgba(0,0,0,0.16)]'
      : 'bg-neutral-950/95 border-white/14 text-neutral-100 shadow-[0_22px_56px_rgba(0,0,0,0.68)]';

    const itemIdle = isLightSurface
      ? 'text-neutral-700 hover:bg-black/6 focus-visible:bg-black/6 focus-visible:ring-neutral-900/35'
      : 'text-neutral-300 hover:bg-white/10 focus-visible:bg-white/10 focus-visible:ring-white/40';

    const itemActive = isLightSurface
      ? 'bg-black/8 text-neutral-950 focus-visible:ring-neutral-900/40'
      : 'bg-white/12 text-white focus-visible:ring-white/45';

    return (
      <div ref={containerRef} className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          onClick={onToggleOpen}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`Styles: ${activeConfig.label}`}
          title={`Switch style (Current: ${activeConfig.label})`}
          className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] h-11 px-3.5 rounded-full text-xs font-semibold tracking-tight shrink-0 transition-[background-color,color,transform] duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 ${triggerClasses}`}
        >
          <span className="shrink-0">Styles</span>
          <span
            className={`text-[11px] font-medium shrink-0 ${
              isOpen
                ? isLightSurface
                  ? 'text-white/75'
                  : 'text-neutral-950/70'
                : isLightSurface
                  ? 'text-neutral-500'
                  : 'text-neutral-400'
            }`}
          >
            {activeConfig.label}
          </span>
          <ChevronUp
            className={`w-3.5 h-3.5 shrink-0 opacity-75 transition-transform duration-150 ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            role="menu"
            aria-label="Style options"
            className={`absolute bottom-full mb-3 left-0 z-50 w-[212px] max-h-[min(70dvh,380px)] overflow-y-auto rounded-2xl border backdrop-blur-2xl p-1.5 ${menuSurface}`}
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
                  className={`w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-left transition-[background-color,color] duration-150 focus:outline-none focus-visible:ring-2 ${
                    isSelected ? itemActive : itemIdle
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    {theme.id === 'grid' ? (
                      <LayoutGrid className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
                    ) : theme.id === 'angles' ? (
                      <Compass className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
                    ) : theme.id === 'terminal' ? (
                      <Monitor className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
                    ) : theme.id === 'scribe' ? (
                      <Tablet className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
                    ) : theme.id === 'hourglass' ? (
                      <Watch className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
                    ) : (
                      <Sparkles className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
                    )}
                    <span className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold leading-tight truncate">
                        {theme.label}
                      </span>
                      <span
                        className={`text-[10px] leading-tight truncate mt-0.5 ${
                          isLightSurface ? 'text-neutral-500' : 'text-neutral-400'
                        }`}
                      >
                        {theme.description}
                      </span>
                    </span>
                  </span>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

ThemeDropdown.displayName = 'ThemeDropdown';
