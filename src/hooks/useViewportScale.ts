import { RefObject, useEffect, useMemo, useState } from 'react';
import {
  CHARISMA_SCENE_LAYOUTS,
  CharismaFrameItem,
  HOURGLASS_SCENE_LAYOUTS,
  isCharismaScene,
  isGridScene,
  isHourglassScene,
  isWaveScene,
  StudioPageId,
  WAVE_SCENE_LAYOUTS,
} from '../types/studio';

interface ViewportMetrics {
  width: number;
  height: number;
  windowWidth: number;
  windowHeight: number;
}

interface SceneLockupConfig {
  width: number;
  height: number;
  mobileMarginX: number;
  mobileMarginY: number;
  desktopMarginX?: number;
  desktopMarginY?: number;
}

export interface ResponsiveGridLayout {
  columns: number;
  rows: number;
  gapClass: string;
}

export interface ResponsiveCharismaWaveLayout {
  rows: readonly (readonly CharismaFrameItem[])[];
  itemGapPx: number;
  rowGapPx: number;
}

export interface ResponsiveHourglassLayout {
  rows: readonly (readonly number[])[];
  gapPx: number;
}

export interface ViewportStageLayout {
  fitScale: number;
  responsiveGrid: ResponsiveGridLayout | null;
  responsiveCharismaWave: ResponsiveCharismaWaveLayout | null;
  responsiveHourglass: ResponsiveHourglassLayout | null;
}

const DEFAULT_DESKTOP_MARGIN_X = 88;
const DEFAULT_DESKTOP_MARGIN_Y = 168;

const MOBILE_PORTRAIT_MAX_WIDTH = 768;
const MOBILE_GRID_PHONE_WIDTH = 420;
const MOBILE_GRID_PHONE_HEIGHT = 824;
const MOBILE_GRID_GAP_PX = 24;
const MOBILE_STAGE_MARGIN_X = 20;
const MOBILE_STAGE_MARGIN_Y = 44;

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
  slant: { width: 1260, height: 1060, mobileMarginX: 28, mobileMarginY: 124 },
  sway: { width: 1660, height: 1100, mobileMarginX: 28, mobileMarginY: 120 },
  'sway-5': { width: 2040, height: 1120, mobileMarginX: 26, mobileMarginY: 120 },
  'sway-6': { width: 2420, height: 1140, mobileMarginX: 24, mobileMarginY: 120 },
  'wave-2': { width: 960, height: 1020, mobileMarginX: 32, mobileMarginY: 128 },
  'wave-3': { width: 1440, height: 1040, mobileMarginX: 28, mobileMarginY: 124 },
  wave: { width: 1860, height: 1040, mobileMarginX: 28, mobileMarginY: 120 },
  'wave-6': { width: 2860, height: 1120, mobileMarginX: 24, mobileMarginY: 120 },
  'wave-8': { width: 1900, height: 1880, mobileMarginX: 24, mobileMarginY: 120 },
  'wave-12': { width: 2820, height: 1880, mobileMarginX: 24, mobileMarginY: 120 },
  'dynamic-1': { width: 640, height: 960, mobileMarginX: 28, mobileMarginY: 128 },
  'dynamic-3': { width: 920, height: 1140, mobileMarginX: 26, mobileMarginY: 124 },
  'dynamic-4': { width: 1000, height: 1080, mobileMarginX: 26, mobileMarginY: 124 },
  'dynamic-5': { width: 1020, height: 980, mobileMarginX: 26, mobileMarginY: 124 },
  'dynamic-8': { width: 780, height: 980, mobileMarginX: 28, mobileMarginY: 128 },
  'dynamic-9': { width: 1040, height: 1060, mobileMarginX: 26, mobileMarginY: 124 },
  'dynamic-12': { width: 640, height: 960, mobileMarginX: 28, mobileMarginY: 128 },
  'dynamic-14': { width: 780, height: 980, mobileMarginX: 28, mobileMarginY: 128 },
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
  'watch-4': { width: 1740, height: 640, mobileMarginX: 26, mobileMarginY: 124 },
  'watch-6': { width: 1310, height: 850, mobileMarginX: 28, mobileMarginY: 124 },
  'apple-watch-1': { width: 620, height: 840, mobileMarginX: 32, mobileMarginY: 128 },
  'apple-watch-3': { width: 1280, height: 670, mobileMarginX: 28, mobileMarginY: 124 },
  'apple-watch-4': { width: 1560, height: 640, mobileMarginX: 26, mobileMarginY: 124 },
  'apple-watch-6': { width: 1180, height: 880, mobileMarginX: 28, mobileMarginY: 124 },
  'live-oak': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
  'live-stand': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
  'live-audio': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
  'live-tile': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
  'live-tufted': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
  'live-draped': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
  'live-table': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
  'live-grip': { width: 1376, height: 768, mobileMarginX: 16, mobileMarginY: 120, desktopMarginX: 64, desktopMarginY: 148 },
};

function chunkBalancedRows<T>(items: readonly T[], maxCols: number): T[][] {
  const total = items.length;
  if (total === 0) return [];
  const rowCount = Math.ceil(total / Math.max(1, maxCols));
  const rows: T[][] = [];
  let cursor = 0;

  for (let rowIdx = 0; rowIdx < rowCount; rowIdx += 1) {
    const remainingItems = total - cursor;
    const remainingRows = rowCount - rowIdx;
    const take = Math.ceil(remainingItems / remainingRows);
    rows.push(items.slice(cursor, cursor + take));
    cursor += take;
  }

  return rows;
}

function computeMobilePortraitGrid(
  count: number,
  availableWidth: number,
  availableHeight: number
): ViewportStageLayout {
  let bestCols = 1;
  let bestRows = count;
  let bestScale = 0;
  let bestEmptySlots = Number.POSITIVE_INFINITY;

  for (let cols = 1; cols <= count; cols += 1) {
    const rows = Math.ceil(count / cols);
    const totalWidth = cols * MOBILE_GRID_PHONE_WIDTH + (cols - 1) * MOBILE_GRID_GAP_PX;
    const totalHeight = rows * MOBILE_GRID_PHONE_HEIGHT + (rows - 1) * MOBILE_GRID_GAP_PX;
    const scale = Math.min(1, availableWidth / totalWidth, availableHeight / totalHeight);
    const emptySlots = cols * rows - count;

    const isClearlyBetterScale = scale > bestScale + 0.002;
    const isTiedScaleWithFewerEmpty =
      Math.abs(scale - bestScale) <= 0.002 && emptySlots < bestEmptySlots;

    if (isClearlyBetterScale || isTiedScaleWithFewerEmpty) {
      bestCols = cols;
      bestRows = rows;
      bestScale = scale;
      bestEmptySlots = emptySlots;
    }
  }

  return {
    fitScale: bestScale,
    responsiveGrid: {
      columns: bestCols,
      rows: bestRows,
      gapClass: 'gap-6',
    },
    responsiveCharismaWave: null,
    responsiveHourglass: null,
  };
}

function computeMobilePortraitStack(
  scene: Extract<StudioPageId, keyof typeof CHARISMA_SCENE_LAYOUTS>,
  availableWidth: number,
  availableHeight: number
): ViewportStageLayout {
  const layout = CHARISMA_SCENE_LAYOUTS[scene];
  const items = layout.items;
  const count = items.length;

  let bestScale = 0;
  let bestEmptySlots = Number.POSITIVE_INFINITY;
  let bestResult: ResponsiveCharismaWaveLayout = {
    rows: [items],
    itemGapPx: layout.itemGapPx,
    rowGapPx: 64,
  };

  for (let cols = 1; cols <= count; cols += 1) {
    const rawRows = chunkBalancedRows(items, cols);
    const rowCount = rawRows.length;
    const maxRowCols = Math.max(...rawRows.map((r) => r.length));
    const emptySlots = maxRowCols * rowCount - count;
    const isMultiRow = rowCount > 1;

    const itemGapPx = isMultiRow ? Math.max(-44, layout.itemGapPx) : layout.itemGapPx;
    const rowGapPx = isMultiRow ? 64 : 0;

    const adaptedRows: CharismaFrameItem[][] = rawRows.map((row) =>
      row.map((item) =>
        isMultiRow
          ? {
              ...item,
              offsetY: Math.round(item.offsetY * 0.35),
              rotateDeg: Math.round(item.rotateDeg * 0.8),
            }
          : item
      )
    );

    const maxAbsOffset = adaptedRows.reduce(
      (maxVal, row) =>
        row.reduce((rowMax, item) => Math.max(rowMax, Math.abs(item.offsetY)), maxVal),
      0
    );
    const maxAbsRotate = adaptedRows.reduce(
      (maxVal, row) =>
        row.reduce((rowMax, item) => Math.max(rowMax, Math.abs(item.rotateDeg)), maxVal),
      0
    );

    const rotatePadX = Math.round(maxAbsRotate * 9);
    const rotatePadY = Math.round(maxAbsRotate * 6.5);
    const totalWidth =
      maxRowCols * MOBILE_GRID_PHONE_WIDTH +
      Math.max(0, maxRowCols - 1) * itemGapPx +
      rotatePadX;
    const totalHeight =
      rowCount * MOBILE_GRID_PHONE_HEIGHT +
      Math.max(0, rowCount - 1) * rowGapPx +
      maxAbsOffset * 2 +
      rotatePadY;

    const scale = Math.min(1, availableWidth / totalWidth, availableHeight / totalHeight);
    const isClearlyBetterScale = scale > bestScale + 0.002;
    const isTiedScaleWithFewerEmpty =
      Math.abs(scale - bestScale) <= 0.002 && emptySlots < bestEmptySlots;

    if (isClearlyBetterScale || isTiedScaleWithFewerEmpty) {
      bestScale = scale;
      bestEmptySlots = emptySlots;
      bestResult = {
        rows: adaptedRows,
        itemGapPx,
        rowGapPx,
      };
    }
  }

  return {
    fitScale: bestScale,
    responsiveGrid: null,
    responsiveCharismaWave: bestResult,
    responsiveHourglass: null,
  };
}

function computeMobilePortraitWave(
  scene: Extract<StudioPageId, keyof typeof WAVE_SCENE_LAYOUTS>,
  availableWidth: number,
  availableHeight: number
): ViewportStageLayout {
  const layout = WAVE_SCENE_LAYOUTS[scene];
  const flatItems = layout.rows && layout.rows.length > 0 ? layout.rows.flat() : layout.items;
  const count = flatItems.length;

  let bestScale = 0;
  let bestEmptySlots = Number.POSITIVE_INFINITY;
  let bestResult: ResponsiveCharismaWaveLayout = {
    rows: [flatItems],
    itemGapPx: layout.itemGapPx,
    rowGapPx: layout.rowGapPx ?? 124,
  };

  for (let cols = 1; cols <= count; cols += 1) {
    const rawRows = chunkBalancedRows(flatItems, cols);
    const rowCount = rawRows.length;
    const maxRowCols = Math.max(...rawRows.map((r) => r.length));
    const emptySlots = maxRowCols * rowCount - count;
    const isMultiRow = rowCount > 1;

    const waveAmp = isMultiRow ? 42 : 0;
    const itemGapPx = isMultiRow ? 42 : layout.itemGapPx;
    const rowGapPx = isMultiRow ? waveAmp * 2 + 40 : 0;

    const adaptedRows: CharismaFrameItem[][] = rawRows.map((row) =>
      row.map((item, idx) =>
        isMultiRow
          ? {
              ...item,
              offsetY: row.length === 1 ? 0 : idx % 2 === 0 ? -waveAmp : waveAmp,
              rotateDeg: 0,
            }
          : item
      )
    );

    const maxAbsOffset = adaptedRows.reduce(
      (maxVal, row) =>
        row.reduce((rowMax, item) => Math.max(rowMax, Math.abs(item.offsetY)), maxVal),
      0
    );

    const totalWidth =
      maxRowCols * MOBILE_GRID_PHONE_WIDTH + Math.max(0, maxRowCols - 1) * itemGapPx;
    const totalHeight =
      rowCount * MOBILE_GRID_PHONE_HEIGHT +
      Math.max(0, rowCount - 1) * rowGapPx +
      maxAbsOffset * 2;

    const scale = Math.min(1, availableWidth / totalWidth, availableHeight / totalHeight);
    const isClearlyBetterScale = scale > bestScale + 0.002;
    const isTiedScaleWithFewerEmpty =
      Math.abs(scale - bestScale) <= 0.002 && emptySlots < bestEmptySlots;

    if (isClearlyBetterScale || isTiedScaleWithFewerEmpty) {
      bestScale = scale;
      bestEmptySlots = emptySlots;
      bestResult = {
        rows: adaptedRows,
        itemGapPx,
        rowGapPx,
      };
    }
  }

  return {
    fitScale: bestScale,
    responsiveGrid: null,
    responsiveCharismaWave: bestResult,
    responsiveHourglass: null,
  };
}

function computeMobilePortraitHourglass(
  scene: Extract<StudioPageId, keyof typeof HOURGLASS_SCENE_LAYOUTS>,
  availableWidth: number,
  availableHeight: number
): ViewportStageLayout {
  const layout = HOURGLASS_SCENE_LAYOUTS[scene];
  const frames = layout.frames;
  const count = frames.length;
  const itemWidth = layout.screenWidthPx + layout.bezelPadPx * 2 + 28;
  const itemHeight =
    layout.screenHeightPx + layout.bezelPadPx * 2 + (layout.showStraps ? layout.strapLengthPx * 2 : 0);
  const gapPx = layout.showStraps ? 40 : 32;

  let bestScale = 0;
  let bestEmptySlots = Number.POSITIVE_INFINITY;
  let bestRows: number[][] = [Array.from(frames)];

  for (let cols = 1; cols <= count; cols += 1) {
    const candidateRows = chunkBalancedRows(frames, cols);
    const rowCount = candidateRows.length;
    const maxRowCols = Math.max(...candidateRows.map((r) => r.length));
    const emptySlots = maxRowCols * rowCount - count;

    const totalWidth = maxRowCols * itemWidth + Math.max(0, maxRowCols - 1) * gapPx;
    const totalHeight = rowCount * itemHeight + Math.max(0, rowCount - 1) * gapPx;
    const scale = Math.min(1, availableWidth / totalWidth, availableHeight / totalHeight);

    const isClearlyBetterScale = scale > bestScale + 0.002;
    const isTiedScaleWithFewerEmpty =
      Math.abs(scale - bestScale) <= 0.002 && emptySlots < bestEmptySlots;

    if (isClearlyBetterScale || isTiedScaleWithFewerEmpty) {
      bestScale = scale;
      bestEmptySlots = emptySlots;
      bestRows = candidateRows;
    }
  }

  return {
    fitScale: bestScale,
    responsiveGrid: null,
    responsiveCharismaWave: null,
    responsiveHourglass: {
      rows: bestRows,
      gapPx,
    },
  };
}

export function useViewportScale(
  activeScene: StudioPageId,
  stageContainerRef?: RefObject<HTMLElement | null>,
  freeze = false
): ViewportStageLayout {
  const [viewport, setViewport] = useState<ViewportMetrics>(() => {
    const winW =
      typeof window !== 'undefined'
        ? Math.round(window.visualViewport?.width ?? window.innerWidth)
        : 1440;
    const winH =
      typeof window !== 'undefined'
        ? Math.round(window.visualViewport?.height ?? window.innerHeight)
        : 900;
    return {
      width: winW,
      height: winH,
      windowWidth: winW,
      windowHeight: winH,
    };
  });

  useEffect(() => {
    if (freeze) return;
    let rafId = 0;

    const measure = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const winW = Math.round(window.visualViewport?.width ?? window.innerWidth);
        const winH = Math.round(window.visualViewport?.height ?? window.innerHeight);
        const container = stageContainerRef?.current;
        let nextWidth = winW;
        let nextHeight = winH;

        if (container && container.clientWidth > 0 && container.clientHeight > 0) {
          const computed = window.getComputedStyle(container);
          const padX =
            (parseFloat(computed.paddingLeft) || 0) + (parseFloat(computed.paddingRight) || 0);
          const padY =
            (parseFloat(computed.paddingTop) || 0) + (parseFloat(computed.paddingBottom) || 0);
          nextWidth = Math.max(200, Math.round(container.clientWidth - padX));
          nextHeight = Math.max(200, Math.round(container.clientHeight - padY));
        }

        setViewport((prev) =>
          prev.width === nextWidth &&
          prev.height === nextHeight &&
          prev.windowWidth === winW &&
          prev.windowHeight === winH
            ? prev
            : { width: nextWidth, height: nextHeight, windowWidth: winW, windowHeight: winH }
        );
      });
    };

    measure();

    const container = stageContainerRef?.current;
    const resizeObserver =
      container && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(measure)
        : null;
    if (container && resizeObserver) {
      resizeObserver.observe(container);
    }

    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('orientationchange', measure, { passive: true });
    window.addEventListener('studio-dock-metrics', measure, { passive: true });
    window.visualViewport?.addEventListener('resize', measure, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure);
      window.removeEventListener('studio-dock-metrics', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [stageContainerRef, freeze]);

  return useMemo(() => {
    const isPortraitMobile =
      viewport.windowWidth < MOBILE_PORTRAIT_MAX_WIDTH &&
      viewport.windowHeight >= viewport.windowWidth;

    if (isPortraitMobile) {
      const isMobileOverlay = viewport.windowWidth < 640;
      const availableWidth = Math.max(220, viewport.width - MOBILE_STAGE_MARGIN_X);
      const availableHeight = Math.max(
        200,
        viewport.height - (isMobileOverlay ? 120 : MOBILE_STAGE_MARGIN_Y)
      );

      if (isGridScene(activeScene)) {
        return computeMobilePortraitGrid(activeScene, availableWidth, availableHeight);
      }

      if (isCharismaScene(activeScene)) {
        return computeMobilePortraitStack(activeScene, availableWidth, availableHeight);
      }

      if (isWaveScene(activeScene)) {
        return computeMobilePortraitWave(activeScene, availableWidth, availableHeight);
      }

      if (isHourglassScene(activeScene)) {
        return computeMobilePortraitHourglass(activeScene, availableWidth, availableHeight);
      }
    }

    const lockup = SCENE_LOCKUPS[activeScene];
    const isMobile = viewport.windowWidth < 640;
    const isTablet = viewport.windowWidth >= 640 && viewport.windowWidth <= 1180;
    const baseDesktopMarginX = lockup.desktopMarginX ?? DEFAULT_DESKTOP_MARGIN_X;
    const baseDesktopMarginY = lockup.desktopMarginY ?? DEFAULT_DESKTOP_MARGIN_Y;
    const marginX = isMobile
      ? lockup.mobileMarginX
      : isTablet && baseDesktopMarginX > 0
        ? Math.min(baseDesktopMarginX, 48)
        : baseDesktopMarginX;
    // Stage container padding already reserves taskbar and top-button clearance on
    // tablet/desktop; this margin guarantees breathing room for rounded bezels and drop shadows.
    const marginY =
      (isMobile ? lockup.mobileMarginY : baseDesktopMarginY) === 0
        ? 0
        : isMobile
          ? lockup.mobileMarginY
          : isTablet
            ? 64
            : 56;
    const availableWidth = Math.max(240, viewport.width - marginX);
    const availableHeight = Math.max(200, viewport.height - marginY);
    const rawScale = Math.min(1, availableWidth / lockup.width, availableHeight / lockup.height);
    const safeScale = Number.isFinite(rawScale)
      ? Math.round(Math.max(0.1, Math.min(1, rawScale)) * 10000) / 10000
      : 1;
    return {
      fitScale: safeScale,
      responsiveGrid: null,
      responsiveCharismaWave: null,
      responsiveHourglass: null,
    };
  }, [activeScene, viewport.width, viewport.height, viewport.windowWidth, viewport.windowHeight]);
}
