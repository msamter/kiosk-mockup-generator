import React, { useMemo } from 'react';

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

export const StudioRangeSlider: React.FC<StudioRangeSliderProps> = React.memo(
  ({
    min,
    max,
    step = 1,
    value,
    disabled = false,
    showStepDots = false,
    isLightSurface,
    widthClassName = 'w-[84px]',
    ariaLabel,
    ariaValueText,
    title,
    onChange,
    onPointerDown,
  }) => {
    const span = max - min;
    const ratio = span > 0 ? Math.max(0, Math.min(1, (value - min) / span)) : 0;

    // Align the thick active progress bar cleanly with the 14px thumb center at every value
    const activeTrackWidth =
      ratio <= 0 ? '0px' : `calc(${ratio * 100}% + ${(0.5 - ratio) * 14}px)`;

    const stepDotRatios = useMemo(() => {
      if (!showStepDots || span <= 0 || step <= 0) return [];
      const count = Math.floor(span / step) + 1;
      if (count <= 1 || count > 24) return [];
      return Array.from({ length: count }, (_, idx) => (idx * step) / span);
    }, [showStepDots, span, step]);

    const sliderVars = (
      isLightSurface
        ? {
            '--slider-thumb-bg': disabled ? '#9e9e9e' : '#000000',
            '--slider-thumb-border': 'transparent',
            '--slider-halo-hover': 'rgba(0, 0, 0, 0.08)',
            '--slider-halo-focus': 'rgba(0, 0, 0, 0.14)',
            '--slider-halo-active': 'rgba(0, 0, 0, 0.22)',
          }
        : {
            '--slider-thumb-bg': disabled ? '#737373' : '#000000',
            '--slider-thumb-border': disabled
              ? 'rgba(255, 255, 255, 0.2)'
              : 'rgba(255, 255, 255, 0.45)',
            '--slider-halo-hover': 'rgba(255, 255, 255, 0.12)',
            '--slider-halo-focus': 'rgba(255, 255, 255, 0.18)',
            '--slider-halo-active': 'rgba(255, 255, 255, 0.26)',
          }
    ) as React.CSSProperties;

    const inactiveTrackClass = disabled
      ? isLightSurface
        ? 'bg-neutral-400/45'
        : 'bg-neutral-600/50'
      : isLightSurface
        ? 'bg-black/20'
        : 'bg-white/30';

    const activeTrackClass = disabled
      ? 'bg-neutral-400'
      : isLightSurface
        ? 'bg-black'
        : 'bg-black ring-1 ring-white/30';

    const stepDotClass = disabled
      ? 'bg-neutral-400'
      : isLightSurface
        ? 'bg-black'
        : 'bg-black ring-1 ring-white/45';

    return (
      <div
        className={`relative flex items-center h-6 shrink-0 select-none overflow-visible ${widthClassName}`}
      >
        {/* Thin inactive track */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 right-0 h-[2px] rounded-full ${inactiveTrackClass}`}
        />

        {/* Thicker active black progress track */}
        <span
          aria-hidden="true"
          style={{ width: activeTrackWidth }}
          className={`pointer-events-none absolute left-0 h-[4px] rounded-full ${activeTrackClass}`}
        />

        {/* Discrete stage dots aligned with each snapped thumb position */}
        {stepDotRatios.length > 0 &&
          stepDotRatios.map((dotRatio, idx) => (
            <span
              key={idx}
              aria-hidden="true"
              style={{
                left: `calc(${dotRatio * 100}% + ${(0.5 - dotRatio) * 14}px)`,
              }}
              className={`pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] w-[5px] h-[5px] rounded-full ${stepDotClass}`}
            />
          ))}

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={onChange}
          onPointerDown={onPointerDown}
          aria-label={ariaLabel}
          aria-valuetext={ariaValueText}
          title={title}
          style={sliderVars}
          className="studio-slider relative z-10 w-full h-6 bg-transparent"
        />
      </div>
    );
  }
);

StudioRangeSlider.displayName = 'StudioRangeSlider';
