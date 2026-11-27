import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, ExternalLink, Globe, Trash2, X } from 'lucide-react';
import {
  loadRecentUrls,
  RecentUrlEntry,
  recordRecentUrl,
  removeRecentUrl,
} from '../../utils/studioStorage';
import { normalizeAndValidateUrl } from '../../utils/urlValidation';

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
    const [recentUrls, setRecentUrls] = useState<RecentUrlEntry[]>(() => loadRecentUrls());
    const inputRef = useRef<HTMLInputElement | null>(null);
    const panelRef = useRef<HTMLDivElement | null>(null);
    const restoreFocusRafRef = useRef<number | null>(null);

    useEffect(() => {
      return () => {
        if (restoreFocusRafRef.current !== null) {
          cancelAnimationFrame(restoreFocusRafRef.current);
          restoreFocusRafRef.current = null;
        }
      };
    }, []);

    const closeAndRestoreFocus = useCallback(() => {
      onClose();
      if (restoreFocusRafRef.current !== null) {
        cancelAnimationFrame(restoreFocusRafRef.current);
      }
      restoreFocusRafRef.current = requestAnimationFrame(() => {
        restoreFocusRafRef.current = null;
        const trigger = document.querySelector<HTMLButtonElement>(
          '[data-url-popover-trigger="true"]'
        );
        trigger?.focus();
      });
    }, [onClose]);

    useEffect(() => {
      if (!isOpen) return;
      setInputValue(activeUrl ?? '');
      setError(null);
      setRecentUrls(loadRecentUrls());
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
          event.preventDefault();
          event.stopPropagation();
          closeAndRestoreFocus();
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
    }, [isOpen, closeAndRestoreFocus, onClose]);

    if (!isOpen) return null;

    const applyValidatedUrl = (rawCandidate: string) => {
      const result = normalizeAndValidateUrl(rawCandidate);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      setRecentUrls(recordRecentUrl(result.url));
      onApplyUrl(result.url, result.displayHost);
      closeAndRestoreFocus();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      applyValidatedUrl(inputValue);
    };

    const panelSurface = isLightSurface
      ? 'bg-[#f8f8fa]/96 border-black/12 text-neutral-950 shadow-[0_20px_56px_rgba(0,0,0,0.18),0_4px_14px_rgba(0,0,0,0.06)]'
      : 'bg-[#1c1c20]/96 border-white/14 text-neutral-100 shadow-[0_24px_64px_rgba(0,0,0,0.72),0_4px_16px_rgba(0,0,0,0.4)]';

    const inputSurface = isLightSurface
      ? 'bg-black/[0.05] border-black/12 text-neutral-950 placeholder:text-neutral-500 focus:bg-white focus:border-neutral-900/50'
      : 'bg-white/[0.06] border-white/14 text-neutral-50 placeholder:text-neutral-400 focus:bg-white/[0.1] focus:border-white/45';

    const primaryBtn = isLightSurface
      ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-[0_2px_10px_rgba(0,0,0,0.16)]'
      : 'bg-white text-neutral-950 hover:bg-neutral-200 shadow-[0_2px_12px_rgba(0,0,0,0.42)]';

    const secondaryBtn = isLightSurface
      ? 'text-neutral-700 hover:text-neutral-950 hover:bg-black/[0.07]'
      : 'text-neutral-300 hover:text-white hover:bg-white/[0.11]';

    const recentChipSurface = isLightSurface
      ? 'bg-black/[0.05] hover:bg-black/[0.1] text-neutral-800 border-black/10'
      : 'bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border-white/12';

    return (
      <div
        id="studio-url-popover"
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Preview live website URL"
        className={`m3-menu-enter origin-bottom absolute bottom-[calc(100%+17px)] inset-x-0 mx-auto md:inset-x-auto md:mx-0 md:right-3 z-50 w-[min(92vw,360px)] max-h-[min(60dvh,var(--studio-dock-available-above,340px))] overflow-y-auto overscroll-contain rounded-[24px] border backdrop-blur-2xl p-4 ${
          isLightSurface ? 'm3-scrollbar-light' : 'm3-scrollbar-dark'
        } ${panelSurface}`}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-tight truncate">
              Preview Live URL
            </span>
          </div>
          <button
            type="button"
            onClick={closeAndRestoreFocus}
            aria-label="Close URL panel"
            className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 -mr-2 -my-1.5 rounded-full m3-spring transition-[background-color,transform] duration-200 active:scale-90 studio-focus-ring ${secondaryBtn}`}
          >
            <X className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
          <div className="flex items-center gap-2">
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
              aria-describedby={error ? 'studio-url-error' : undefined}
              className={`flex-1 min-w-0 min-h-[44px] h-11 px-3.5 rounded-full border text-xs transition-[background-color,border-color] duration-150 studio-focus-ring ${inputSurface}`}
            />
            <button
              type="submit"
              className={`min-h-[44px] h-11 px-4 rounded-full text-xs font-semibold shrink-0 m3-spring transition-[background-color,transform] duration-200 active:scale-95 studio-focus-ring ${primaryBtn}`}
            >
              Load
            </button>
          </div>

          {error && (
            <p
              id="studio-url-error"
              role="alert"
              className={`text-[11px] leading-snug font-medium ${
                isLightSurface ? 'text-red-700' : 'text-red-400'
              }`}
            >
              {error}
            </p>
          )}
        </form>

        {recentUrls.length > 0 && (
          <div
            className={`mt-3 pt-2.5 border-t space-y-1.5 ${
              isLightSurface ? 'border-black/10' : 'border-white/10'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 shrink-0 opacity-65" aria-hidden="true" />
              <span
                className={`text-[11px] font-medium ${
                  isLightSurface ? 'text-neutral-600' : 'text-neutral-400'
                }`}
              >
                Recent URLs
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {recentUrls.map((entry) => (
                <div
                  key={entry.url}
                  className={`flex items-center gap-1 rounded-full border pl-3 pr-1 ${recentChipSurface}`}
                >
                  <button
                    type="button"
                    onClick={() => applyValidatedUrl(entry.url)}
                    className="flex-1 min-w-0 min-h-[44px] py-2 text-left text-[11px] font-medium truncate studio-focus-ring rounded-full"
                    title={entry.url}
                  >
                    {entry.displayHost}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecentUrls(removeRecentUrl(entry.url))}
                    aria-label={`Remove ${entry.displayHost} from recent URLs`}
                    className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-full shrink-0 transition-colors studio-focus-ring ${secondaryBtn}`}
                  >
                    <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeUrl && (
          <div
            className={`mt-2.5 pt-2.5 border-t flex items-center justify-between gap-2 ${
              isLightSurface ? 'border-black/10' : 'border-white/10'
            }`}
          >
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-2 -ml-2 rounded-full text-[11px] font-medium truncate transition-colors hover:underline studio-focus-ring ${
                isLightSurface ? 'text-neutral-800' : 'text-neutral-200'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
              <span className="truncate">Open in new tab</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClearUrl();
                setInputValue('');
                setError(null);
              }}
              className={`inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-[11px] font-medium shrink-0 transition-colors studio-focus-ring ${secondaryBtn}`}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

UrlPopover.displayName = 'UrlPopover';
