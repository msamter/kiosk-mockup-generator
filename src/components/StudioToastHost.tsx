import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { StudioToast } from '../types/studio';

export interface StudioToastHostHandle {
  show: (message: string, tone?: StudioToast['tone'], durationMs?: number) => void;
  announce: (message: string) => void;
  clear: () => void;
}

interface StudioToastHostProps {
  hidden: boolean;
  isLightSurface: boolean;
}

export const StudioToastHost = React.memo(
  React.forwardRef<StudioToastHostHandle, StudioToastHostProps>(({ hidden, isLightSurface }, ref) => {
    const [toast, setToast] = useState<StudioToast | null>(null);
    const [politeAnnouncement, setPoliteAnnouncement] = useState<string>('');
    const timerRef = useRef<number | null>(null);
    const announceTimerRef = useRef<number | null>(null);
    const nextIdRef = useRef(1);

    const clearTimer = useCallback(() => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const clearAnnounceTimer = useCallback(() => {
      if (announceTimerRef.current !== null) {
        window.clearTimeout(announceTimerRef.current);
        announceTimerRef.current = null;
      }
    }, []);

    const clear = useCallback(() => {
      clearTimer();
      setToast(null);
    }, [clearTimer]);

    const announce = useCallback(
      (message: string) => {
        clearAnnounceTimer();
        // Reset briefly so repeated announcements of the same text still trigger SR live updates
        setPoliteAnnouncement('');
        announceTimerRef.current = window.setTimeout(() => {
          announceTimerRef.current = null;
          setPoliteAnnouncement(message);
        }, 25);
      },
      [clearAnnounceTimer]
    );

    const show = useCallback(
      (message: string, tone: StudioToast['tone'] = 'info', durationMs = 3400) => {
        clearTimer();
        const id = nextIdRef.current++;
        setToast({ id, message, tone });
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          setToast((current) => (current?.id === id ? null : current));
        }, durationMs);
      },
      [clearTimer]
    );

    useImperativeHandle(ref, () => ({ show, announce, clear }), [show, announce, clear]);

    useEffect(() => {
      return () => {
        clearTimer();
        clearAnnounceTimer();
      };
    }, [clearTimer, clearAnnounceTimer]);

    const surfaceClasses = isLightSurface
      ? 'bg-white/96 text-neutral-950 border-black/15 shadow-[0_12px_32px_rgba(0,0,0,0.16)]'
      : 'bg-neutral-900/96 text-neutral-50 border-white/16 shadow-[0_14px_36px_rgba(0,0,0,0.6)]';

    const iconNode =
      toast?.tone === 'success' ? (
        <CheckCircle2
          className={`w-4 h-4 shrink-0 ${isLightSurface ? 'text-emerald-700' : 'text-emerald-400'}`}
          aria-hidden="true"
        />
      ) : toast?.tone === 'error' ? (
        <AlertCircle
          className={`w-4 h-4 shrink-0 ${isLightSurface ? 'text-red-700' : 'text-red-400'}`}
          aria-hidden="true"
        />
      ) : (
        <Info
          className={`w-4 h-4 shrink-0 ${isLightSurface ? 'text-neutral-700' : 'text-neutral-300'}`}
          aria-hidden="true"
        />
      );

    return (
      <>
        {/* Permanently mounted polite live region for screen-reader state updates */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {politeAnnouncement}
        </div>

        {/* Permanently mounted toast live region so assistive tech registers dynamic messages reliably */}
        <div
          role={toast?.tone === 'error' ? 'alert' : 'status'}
          aria-live={toast?.tone === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
          style={{
            paddingTop: 'var(--app-viewport-top, 0px)',
          }}
          className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 max-w-[min(92vw,440px)]"
        >
          {!hidden && toast && (
            <div
              className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl text-xs font-medium leading-snug ${surfaceClasses}`}
            >
              {iconNode}
              <span>{toast.message}</span>
            </div>
          )}
        </div>
      </>
    );
  })
);

StudioToastHost.displayName = 'StudioToastHost';
