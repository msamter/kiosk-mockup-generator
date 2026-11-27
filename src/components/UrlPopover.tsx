import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Globe, Trash2, X } from 'lucide-react';
import { normalizeAndValidateUrl } from '../utils/urlValidation';

interface UrlPopoverProps {
  isOpen: boolean;
  activeUrl: string | null;
  isLightSurface: boolean;
  onApplyUrl: (normalizedUrl: string, displayHost: string) => void;
  onClearUrl: () => void;
  onClose: () => void;
}

export const UrlPopover: React.FC<UrlPopoverProps> = React.memo(
  ({ isOpen, activeUrl, isLightSurface, onApplyUrl, onClearUrl, onClose }) => {
    const [inputValue, setInputValue] = useState(activeUrl ?? '');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (!isOpen) return;
      setInputValue(activeUrl ?? '');
      setError(null);
      const rafId = requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
      return () => cancelAnimationFrame(rafId);
    }, [isOpen, activeUrl]);

    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (panelRef.current && !panelRef.current.contains(target)) {
          const trigger = (target as Element).closest?.('[data-url-popover-trigger="true"]');
          if (!trigger) {
            onClose();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('pointerdown', handlePointerDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('pointerdown', handlePointerDown);
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const result = normalizeAndValidateUrl(inputValue);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      onApplyUrl(result.url, result.displayHost);
      onClose();
    };

    const panelSurface = isLightSurface
      ? 'bg-white/95 border-black/12 text-neutral-900 shadow-[0_18px_48px_rgba(0,0,0,0.16)]'
      : 'bg-neutral-950/95 border-white/14 text-neutral-100 shadow-[0_22px_56px_rgba(0,0,0,0.65)]';

    const inputSurface = isLightSurface
      ? 'bg-neutral-100 border-black/12 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900/40'
      : 'bg-neutral-900 border-white/12 text-neutral-100 placeholder:text-neutral-500 focus:border-white/35';

    const primaryBtn = isLightSurface
      ? 'bg-neutral-900 text-white hover:bg-neutral-800'
      : 'bg-white text-neutral-950 hover:bg-neutral-200';

    const secondaryBtn = isLightSurface
      ? 'text-neutral-600 hover:text-neutral-900 hover:bg-black/6'
      : 'text-neutral-400 hover:text-white hover:bg-white/10';

    return (
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Preview live website URL"
        className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 xl:left-auto xl:right-0 xl:translate-x-0 z-50 w-[min(90vw,340px)] rounded-2xl border backdrop-blur-2xl p-3.5 ${panelSurface}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Globe className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-tight truncate">
              Preview Live URL
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close URL panel"
            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${secondaryBtn}`}
          >
            <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2" noValidate>
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                if (error) setError(null);
              }}
              placeholder="https://example.com"
              aria-label="Website or web app URL"
              aria-invalid={error ? 'true' : 'false'}
              className={`flex-1 min-w-0 h-9 px-2.5 rounded-lg border text-xs outline-none transition-colors ${inputSurface}`}
            />
            <button
              type="submit"
              className={`h-9 px-3.5 rounded-lg text-xs font-semibold shrink-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-current/35 ${primaryBtn}`}
            >
              Load
            </button>
          </div>

          {error && (
            <p role="alert" className="text-[11px] leading-snug text-red-500 font-medium">
              {error}
            </p>
          )}
        </form>

        {activeUrl && (
          <div
            className={`mt-2.5 pt-2.5 border-t flex items-center justify-between gap-2 ${
              isLightSurface ? 'border-black/8' : 'border-white/10'
            }`}
          >
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-[11px] font-medium truncate transition-colors hover:underline ${
                isLightSurface ? 'text-neutral-700' : 'text-neutral-300'
              }`}
            >
              <ExternalLink className="w-3 h-3 shrink-0 opacity-75" aria-hidden="true" />
              <span className="truncate">Open in new tab</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClearUrl();
                setInputValue('');
                setError(null);
              }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors ${secondaryBtn}`}
            >
              <Trash2 className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

UrlPopover.displayName = 'UrlPopover';
