import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { StudioToast } from '../types/studio';

export interface StudioToastHostHandle {
  show: (message: string, tone?: StudioToast['tone'], durationMs?: number) => void;
  clear: () => void;
}

interface StudioToastHostProps {
  hidden: boolean;
  isLightSurface: boolean;
}

export const StudioToastHost = React.memo(
  React.forwardRef<StudioToastHostHandle, StudioToastHostProps>(({ hidden, isLightSurface }, ref) => {
    const [toast, setToast] = useState<StudioToast | null>(null);
    const timerRef = useRef<number | null>(null);
    const nextIdRef = useRef(1);

    const clearTimer = useCallback(() => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const clear = useCallback(() => {
      clearTimer();
      setToast(null);
    }, [clearTimer]);

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

    useImperativeHandle(ref, () => ({ show, clear }), [show, clear]);

    useEffect(() => {
      return () => {
        clearTimer();
      };
    }, [clearTimer]);

    if (hidden || !toast) return null;

    const surfaceClasses = isLightSurface
      ? 'bg-white/94 text-neutral-900 border-black/12 shadow-[0_12px_32px_rgba(0,0,0,0.14)]'
      : 'bg-neutral-900/94 text-neutral-100 border-white/14 shadow-[0_14px_36px_rgba(0,0,0,0.55)]';

    const iconNode =
      toast.tone === 'success' ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" aria-hidden="true" />
      ) : toast.tone === 'error' ? (
        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" aria-hidden="true" />
      ) : (
        <Info className="w-4 h-4 shrink-0 text-neutral-400" aria-hidden="true" />
      );

    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 max-w-[min(92vw,440px)]"
      >
        <div
          className={`inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-xl text-xs font-medium leading-snug ${surfaceClasses}`}
        >
          {iconNode}
          <span>{toast.message}</span>
        </div>
      </div>
    );
  })
);

StudioToastHost.displayName = 'StudioToastHost';
