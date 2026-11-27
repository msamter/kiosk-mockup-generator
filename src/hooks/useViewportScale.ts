import { useEffect, useMemo, useState } from 'react';
import { StudioPageId } from '../types/studio';

interface ViewportMetrics {
  width: number;
  height: number;
}

interface SceneLockupConfig {
  width: number;
  height: number;
  mobileMarginX: number;
  mobileMarginY: number;
  desktopMarginX?: number;
  desktopMarginY?: number;
}

const DEFAULT_DESKTOP_MARGIN_X = 88;
const DEFAULT_DESKTOP_MARGIN_Y = 168;

const SCENE_LOCKUPS: Record<StudioPageId, SceneLockupConfig> = {
  1: { width: 420, height: 824, mobileMarginX: 32, mobileMarginY: 128 },
  2: { width: 840, height: 824, mobileMarginX: 28, mobileMarginY: 124 },
  3: { width: 1260, height: 824, mobileMarginX: 28, mobileMarginY: 122 },
  4: { width: 1680, height: 824, mobileMarginX: 28, mobileMarginY: 120 },
  6: { width: 2532, height: 824, mobileMarginX: 24, mobileMarginY: 120 },
  8: { width: 1684, height: 1648, mobileMarginX: 24, mobileMarginY: 120 },
  12: { width: 2656, height: 1680, mobileMarginX: 24, mobileMarginY: 120 },
  16: { width: 3552, height: 1680, mobileMarginX: 24, mobileMarginY: 120 },
  peek: {
    width: 1120,
    height: 980,
    mobileMarginX: 0,
    mobileMarginY: 0,
    desktopMarginX: 0,
    desktopMarginY: 0,
  },
  offset: {
    width: 1320,
    height: 1120,
    mobileMarginX: 24,
    mobileMarginY: 0,
    desktopMarginX: 48,
    desktopMarginY: 0,
  },
  cascade: {
    width: 1460,
    height: 1020,
    mobileMarginX: 28,
    mobileMarginY: 120,
  },
  quad: {
    width: 1520,
    height: 1240,
    mobileMarginX: 0,
    mobileMarginY: 0,
    desktopMarginX: 0,
    desktopMarginY: 0,
  },
  masonry: {
    width: 1920,
    height: 1360,
    mobileMarginX: 16,
    mobileMarginY: 0,
    desktopMarginX: 40,
    desktopMarginY: 0,
  },
  'tilt-right': {
    width: 1920,
    height: 1320,
    mobileMarginX: 0,
    mobileMarginY: 0,
    desktopMarginX: 0,
    desktopMarginY: 0,
  },
  'tilt-left': {
    width: 1920,
    height: 1320,
    mobileMarginX: 0,
    mobileMarginY: 0,
    desktopMarginX: 0,
    desktopMarginY: 0,
  },
  duo: { width: 1040, height: 960, mobileMarginX: 32, mobileMarginY: 128 },
  fan: { width: 1440, height: 1040, mobileMarginX: 28, mobileMarginY: 124 },
  deck: { width: 1360, height: 1020, mobileMarginX: 28, mobileMarginY: 124 },
  slant: { width: 1260, height: 1060, mobileMarginX: 28, mobileMarginY: 124 },
  stack: { width: 1580, height: 1080, mobileMarginX: 28, mobileMarginY: 120 },
  sway: { width: 1660, height: 1100, mobileMarginX: 28, mobileMarginY: 120 },
  wave: { width: 1860, height: 1040, mobileMarginX: 28, mobileMarginY: 120 },
  peak: { width: 1860, height: 1180, mobileMarginX: 28, mobileMarginY: 120 },
  desktop: { width: 1360, height: 940, mobileMarginX: 28, mobileMarginY: 128 },
  macbook: { width: 1410, height: 840, mobileMarginX: 28, mobileMarginY: 128 },
  ultrawide: { width: 1550, height: 825, mobileMarginX: 24, mobileMarginY: 128 },
  browser: { width: 1140, height: 820, mobileMarginX: 28, mobileMarginY: 128 },
  'tablet-1': { width: 860, height: 1110, mobileMarginX: 32, mobileMarginY: 128 },
  'tablet-2': { width: 1720, height: 1110, mobileMarginX: 28, mobileMarginY: 124 },
  'tablet-mini': { width: 720, height: 1020, mobileMarginX: 32, mobileMarginY: 128 },
  'tablet-pro': { width: 1260, height: 960, mobileMarginX: 28, mobileMarginY: 128 },
  'tablet-wide': { width: 1380, height: 890, mobileMarginX: 26, mobileMarginY: 128 },
  'tablet-pair': { width: 1740, height: 880, mobileMarginX: 26, mobileMarginY: 124 },
  'watch-1': { width: 640, height: 840, mobileMarginX: 32, mobileMarginY: 128 },
  'watch-3': { width: 1420, height: 680, mobileMarginX: 28, mobileMarginY: 124 },
  'watch-6': { width: 1310, height: 850, mobileMarginX: 28, mobileMarginY: 124 },
};

export function useViewportScale(activeScene: StudioPageId): number {
  const [viewport, setViewport] = useState<ViewportMetrics>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));

  useEffect(() => {
    let rafId = 0;

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const nextWidth = window.innerWidth;
        const nextHeight = window.innerHeight;
        setViewport((prev) =>
          prev.width === nextWidth && prev.height === nextHeight
            ? prev
            : { width: nextWidth, height: nextHeight }
        );
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return useMemo(() => {
    const lockup = SCENE_LOCKUPS[activeScene];
    const isMobile = viewport.width < 640;
    const marginX = isMobile
      ? lockup.mobileMarginX
      : (lockup.desktopMarginX ?? DEFAULT_DESKTOP_MARGIN_X);
    const marginY = isMobile
      ? lockup.mobileMarginY
      : (lockup.desktopMarginY ?? DEFAULT_DESKTOP_MARGIN_Y);
    const availableWidth = Math.max(260, viewport.width - marginX);
    const availableHeight = Math.max(260, viewport.height - marginY);
    return Math.min(1, availableWidth / lockup.width, availableHeight / lockup.height);
  }, [activeScene, viewport.width, viewport.height]);
}
