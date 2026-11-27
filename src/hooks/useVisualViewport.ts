import { useEffect, useState } from 'react';

export interface VisibleViewportMetrics {
  width: number;
  height: number;
  top: number;
  bottomOffset: number;
}

function readVisibleViewport(): VisibleViewportMetrics {
  if (typeof window === 'undefined') {
    return { width: 1440, height: 900, top: 0, bottomOffset: 0 };
  }

  const docEl = document.documentElement;
  const layoutWidth = window.innerWidth || docEl.clientWidth || 1440;
  const layoutHeight = window.innerHeight || docEl.clientHeight || 900;
  const clientWidth = docEl.clientWidth > 0 ? docEl.clientWidth : layoutWidth;
  const clientHeight = docEl.clientHeight > 0 ? docEl.clientHeight : layoutHeight;
  const vv = window.visualViewport;
  const vvTop = vv ? Math.max(0, Math.round(vv.offsetTop)) : 0;
  const vvWidth = vv && vv.width > 0 ? vv.width : layoutWidth;
  const vvHeight = vv && vv.height > 0 ? vv.height : layoutHeight;

  const visibleWidth = Math.max(240, Math.round(Math.min(layoutWidth, clientWidth, vvWidth)));
  const visibleHeight = Math.max(240, Math.round(Math.min(layoutHeight, clientHeight, vvHeight)));
  const bottomOffset = Math.max(0, Math.round(layoutHeight - (vvTop + visibleHeight)));

  return {
    width: visibleWidth,
    height: visibleHeight,
    top: vvTop,
    bottomOffset,
  };
}

let lastAppliedTop = -1;
let lastAppliedHeight = -1;
let lastAppliedBottomOffset = -1;

function applyViewportCssVars(metrics: VisibleViewportMetrics): void {
  if (typeof document === 'undefined') return;
  const rootStyle = document.documentElement.style;
  if (metrics.top !== lastAppliedTop) {
    lastAppliedTop = metrics.top;
    rootStyle.setProperty('--app-viewport-top', `${metrics.top}px`);
  }
  if (metrics.height !== lastAppliedHeight) {
    lastAppliedHeight = metrics.height;
    rootStyle.setProperty('--app-viewport-height', `${metrics.height}px`);
  }
  if (metrics.bottomOffset !== lastAppliedBottomOffset) {
    lastAppliedBottomOffset = metrics.bottomOffset;
    rootStyle.setProperty('--app-viewport-bottom-offset', `${metrics.bottomOffset}px`);
  }
}

/**
 * Tracks the exact visible viewport rectangle across desktop, tablet (iPadOS/Android),
 * mobile browsers, and embedded preview frames so bottom-anchored controls never get
 * clipped below browser toolbars, safe areas, or layout-viewport overflow.
 */
export function useVisualViewport(): VisibleViewportMetrics {
  const [metrics, setMetrics] = useState<VisibleViewportMetrics>(() => {
    const initial = readVisibleViewport();
    applyViewportCssVars(initial);
    return initial;
  });

  useEffect(() => {
    let rafId = 0;

    const syncViewport = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (window.scrollY !== 0 || window.scrollX !== 0) {
          window.scrollTo(0, 0);
        }
        const next = readVisibleViewport();
        applyViewportCssVars(next);
        setMetrics((prev) =>
          prev.width === next.width &&
          prev.height === next.height &&
          prev.top === next.top &&
          prev.bottomOffset === next.bottomOffset
            ? prev
            : next
        );
      });
    };

    syncViewport();

    const vv = window.visualViewport;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncViewport) : null;
    resizeObserver?.observe(document.documentElement);

    window.addEventListener('resize', syncViewport, { passive: true });
    window.addEventListener('orientationchange', syncViewport, { passive: true });
    window.addEventListener('pageshow', syncViewport, { passive: true });
    vv?.addEventListener('resize', syncViewport, { passive: true });
    vv?.addEventListener('scroll', syncViewport, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      window.removeEventListener('pageshow', syncViewport);
      vv?.removeEventListener('resize', syncViewport);
      vv?.removeEventListener('scroll', syncViewport);
    };
  }, []);

  return metrics;
}
