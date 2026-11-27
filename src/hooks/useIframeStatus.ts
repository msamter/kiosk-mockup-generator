import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_IFRAME_LOAD_TIMEOUT_MS = 8500;

interface UseIframeStatusResult {
  iframeLoading: boolean;
  iframeBlocked: boolean;
  localReload: number;
  handleIframeLoad: () => void;
  handleIframeError: () => void;
  triggerLocalReload: () => void;
}

/**
 * Tracks iframe load/timeout/blocked state for embedded live URL previews,
 * ensuring pending timers always clear on load, error, URL change, or unmount.
 */
export function useIframeStatus(
  effectiveIframeSrc: string | null,
  reloadNonce: number,
  timeoutMs = DEFAULT_IFRAME_LOAD_TIMEOUT_MS
): UseIframeStatusResult {
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [localReload, setLocalReload] = useState(0);
  const loadTimeoutRef = useRef<number | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (loadTimeoutRef.current !== null) {
      window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearPendingTimeout();

    if (!effectiveIframeSrc) {
      setIframeLoading(false);
      setIframeBlocked(false);
      return;
    }

    setIframeLoading(true);
    setIframeBlocked(false);

    loadTimeoutRef.current = window.setTimeout(() => {
      loadTimeoutRef.current = null;
      setIframeLoading(false);
      setIframeBlocked(true);
    }, timeoutMs);

    return clearPendingTimeout;
  }, [effectiveIframeSrc, reloadNonce, localReload, timeoutMs, clearPendingTimeout]);

  const handleIframeLoad = useCallback(() => {
    clearPendingTimeout();
    setIframeLoading(false);
    setIframeBlocked(false);
  }, [clearPendingTimeout]);

  const handleIframeError = useCallback(() => {
    clearPendingTimeout();
    setIframeLoading(false);
    setIframeBlocked(true);
  }, [clearPendingTimeout]);

  const triggerLocalReload = useCallback(() => {
    setLocalReload((prev) => prev + 1);
  }, []);

  return {
    iframeLoading,
    iframeBlocked,
    localReload,
    handleIframeLoad,
    handleIframeError,
    triggerLocalReload,
  };
}
