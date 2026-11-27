import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface StudioRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  disabled?: boolean;
  showStepDots?: boolean;
  isLightSurface: boolean;
  widthClassName?: string;
  ariaLabel: string;
  ariaValueText?: string;
  title?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPointerDown?: (event: React.PointerEvent<HTMLInputElement>) => void;
}

/**
 * Material 3 Expressive Slider:
 * - Thick pill-ended split tracks (12px tall) separated by an intentional gap around the handle
 * - Tall vertical bar handle (4px × 22px) that narrows & lengthens on active drag with spring physics
 * - Terminal end-stop indicator dot on the inactive track
 */
export const StudioRangeSlider: React.FC<StudioRangeSliderProps> = React.memo(
  ({
    min,
    max,
    step = 1,
    value,
    disabled = false,
    showStepDots = false,
    isLightSurface,
    widthClassName = 'w-[96px]',
    ariaLabel,
    ariaValueText,
    title,
    onChange,
    onPointerDown,
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const cleanupPointerRef = useRef<(() => void) | null>(null);

    useEffect(() => {
      return () => {
        cleanupPointerRef.current?.();
        cleanupPointerRef.current = null;
      };
    }, []);

    const span = max - min;
    const safeValue = Number.isFinite(value) ? value : min;
    const ratio = span > 0 ? Math.max(0, Math.min(1, (safeValue - min) / span)) : 0;

    // Keep the vertical bar handle cleanly inset by 6px from both track ends
    const handleCenterExpr = `calc(6px + (100% - 12px) * ${ratio.toFixed(5)})`;
    // 6px visual gap on each side of the vertical bar handle (classic M3 Expressive split track)
    const activeTrackWidth = `max(0px, calc(${handleCenterExpr} - 6px))`;
    const inactiveTrackLeft = `calc(${handleCenterExpr} + 6px)`;

    const stepDotRatios = useMemo(() => {
      if (!showStepDots || span <= 0 || step <= 0) return [];
      const count = Math.floor(span / step) + 1;
      if (count <= 1 || count > 24) return [];
      return Array.from({ length: count }, (_, idx) => (idx * step) / span);
    }, [showStepDots, span, step]);

    const handlePointerDown = useCallback(
      (event: React.PointerEvent<HTMLInputElement>) => {
        if (!disabled) {
          cleanupPointerRef.current?.();
          setIsDragging(true);
          const finish = () => {
            setIsDragging(false);
            window.removeEventListener('pointerup', finish);
            window.removeEventListener('pointercancel', finish);
            cleanupPointerRef.current = null;
          };
          window.addEventListener('pointerup', finish, { once: true });
          window.addEventListener('pointercancel', finish, { once: true });
          cleanupPointerRef.current = () => {
            window.removeEventListener('pointerup', finish);
            window.removeEventListener('pointercancel', finish);
          };
        }
        onPointerDown?.(event);
      },
      [disabled, onPointerDown]
    );

    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      try {
        setIsFocused(event.currentTarget.matches(':focus-visible'));
      } catch {
        setIsFocused(true);
      }
    }, []);

    const activeTrackBg = disabled
      ? 'bg-neutral-400/60'
      : isLightSurface
        ? 'bg-neutral-900'
        : 'bg-white';

    const inactiveTrackBg = disabled
      ? isLightSurface
        ? 'bg-black/8'
        : 'bg-white/10'
      : isLightSurface
        ? 'bg-black/14'
        : 'bg-white/18';

    const handleBg = disabled
      ? 'bg-neutral-400'
      : isLightSurface
        ? 'bg-neutral-950'
        : 'bg-white';

    const stopDotBg = isLightSurface ? 'bg-neutral-900/55' : 'bg-white/60';

    return (
      <div
        className={`group/slider relative flex items-center min-h-[44px] h-11 shrink-0 select-none ${widthClassName}`}
      >
        {/* Expressive active pill track (left of handle gap) */}
        <span
          aria-hidden="true"
          style={{ width: activeTrackWidth }}
          className={`pointer-events-none absolute left-0 h-[12px] rounded-l-full rounded-r-[3px] transition-[background-color] duration-150 ${activeTrackBg}`}
        />

        {/* Expressive inactive pill track (right of handle gap) */}
        <span
          aria-hidden="true"
          style={{ left: inactiveTrackLeft, right: 0 }}
          className={`pointer-events-none absolute h-[12px] rounded-r-full rounded-l-[3px] transition-[background-color] duration-150 ${inactiveTrackBg}`}
        />

        {/* M3 Expressive terminal end-stop dot inside right track cap */}
        {ratio < 0.94 && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute right-[4px] top-1/2 -translate-y-1/2 w-[4px] h-[4px] rounded-full ${stopDotBg}`}
          />
        )}

        {/* Optional discrete step dots */}
        {stepDotRatios.length > 0 &&
          stepDotRatios.map((dotRatio, idx) => {
            const isNearHandle = Math.abs(dotRatio - ratio) < 0.06;
            if (isNearHandle) return null;
            const isActiveSide = dotRatio < ratio;
            return (
              <span
                key={idx}
                aria-hidden="true"
                style={{
                  left: `calc(6px + (100% - 12px) * ${dotRatio.toFixed(5)})`,
                }}
                className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] w-[3px] h-[3px] rounded-full ${
                  isActiveSide
                    ? isLightSurface
                      ? 'bg-white/70'
                      : 'bg-neutral-900/70'
                    : stopDotBg
                }`}
              />
            );
          })}

        {/* M3 Expressive vertical bar handle with GPU-composited spring morph on active drag */}
        <span
          aria-hidden="true"
          style={{ left: handleCenterExpr }}
          className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-[3] w-[4px] h-[22px] rounded-full m3-spring transition-[transform,box-shadow,background-color] duration-200 ${handleBg} ${
            isDragging
              ? 'scale-x-[0.75] scale-y-[1.18]'
              : 'scale-100 group-hover/slider:scale-y-[1.09]'
          } ${
            isFocused
              ? isLightSurface
                ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-[#f4f4f6]'
                : 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#1a1a1e]'
              : ''
          }`}
        />

        {/* Accessible native input overlay */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onPointerDown={handlePointerDown}
          onFocus={handleFocus}
          onBlur={() => setIsFocused(false)}
          aria-label={ariaLabel}
          aria-valuetext={ariaValueText}
          title={title}
          className="studio-slider relative z-10 w-full h-11 bg-transparent"
        />
      </div>
    );
  }
);

StudioRangeSlider.displayName = 'StudioRangeSlider';
