import React, { useCallback, useEffect, useState } from 'react';
import { Camera, Loader2, Maximize, Minimize } from 'lucide-react';

interface ScreenshotButtonProps {
  isCapturing: boolean;
  isBusy: boolean;
  isLightSurface: boolean;
  onCapture: () => void;
  onFullscreenError?: (message: string) => void;
}

interface WebkitDocument extends Document {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
}

interface WebkitElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void;
}

function getIsFullscreen(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as WebkitDocument;
  return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
}

export const ScreenshotButton: React.FC<ScreenshotButtonProps> = React.memo(
  ({ isCapturing, isBusy, isLightSurface, onCapture, onFullscreenError }) => {
    const [isFullscreen, setIsFullscreen] = useState<boolean>(getIsFullscreen);

    useEffect(() => {
      const handleFullscreenChange = () => {
        setIsFullscreen(getIsFullscreen());
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      };
    }, []);

    const handleToggleFullscreen = useCallback(async () => {
      const doc = document as WebkitDocument;
      const rootEl = document.documentElement as WebkitElement;

      try {
        if (getIsFullscreen()) {
          if (typeof doc.exitFullscreen === 'function') {
            await doc.exitFullscreen();
          } else if (typeof doc.webkitExitFullscreen === 'function') {
            await doc.webkitExitFullscreen();
          }
        } else {
          if (typeof rootEl.requestFullscreen === 'function') {
            await rootEl.requestFullscreen();
          } else if (typeof rootEl.webkitRequestFullscreen === 'function') {
            await rootEl.webkitRequestFullscreen();
          } else {
            onFullscreenError?.('Fullscreen mode is not supported in this browser.');
          }
        }
      } catch {
        onFullscreenError?.(
          'Fullscreen mode was blocked here. Try opening the app in a standalone tab.'
        );
      }
    }, [onFullscreenError]);

    if (isCapturing) return null;

    const surfaceClasses = isLightSurface
      ? 'bg-white/90 text-neutral-900 border-black/12 hover:bg-white shadow-[0_14px_40px_rgba(0,0,0,0.14)] focus-visible:ring-neutral-900/35'
      : 'bg-neutral-950/88 text-neutral-100 border-white/14 hover:bg-neutral-900/95 shadow-[0_18px_48px_rgba(0,0,0,0.62)] focus-visible:ring-white/45';

    const buttonClasses = `inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border backdrop-blur-2xl transition-[background-color,transform,opacity] duration-150 active:scale-[0.98] focus:outline-none focus-visible:ring-2 ${surfaceClasses}`;

    return (
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleToggleFullscreen()}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          aria-pressed={isFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className={buttonClasses}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <Maximize className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onCapture}
          disabled={isBusy}
          aria-label="Capture clean 16:9 screenshot"
          title="Capture clean 16:9 PNG screenshot"
          className={`${buttonClasses} disabled:opacity-60 disabled:cursor-wait`}
        >
          {isBusy ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <Camera className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

ScreenshotButton.displayName = 'ScreenshotButton';
