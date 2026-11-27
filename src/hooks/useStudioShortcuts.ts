import { useEffect } from 'react';
import { StudioPageId } from '../types/studio';

interface UseStudioShortcutsOptions {
  disabled?: boolean;
  availableScenes: readonly StudioPageId[];
  onToggleTaskbar: () => void;
  onSelectScene: (scene: StudioPageId) => void;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tagName = target.tagName;
  if (tagName === 'TEXTAREA' || tagName === 'SELECT') return true;
  if (tagName === 'INPUT') {
    const input = target as HTMLInputElement;
    // Allow shortcuts when focus is on a range slider, but block text/url/search/number inputs
    return input.type !== 'range' && input.type !== 'button' && input.type !== 'checkbox';
  }
  return Boolean(target.closest('[contenteditable="true"]'));
}

/**
 * Global keyboard shortcuts for Showcase Studio:
 * - 'M': Toggle taskbar visibility (minimize / expand)
 * - '1'–'9': Select / cycle through the active theme's scenes
 */
export function useStudioShortcuts({
  disabled = false,
  availableScenes,
  onToggleTaskbar,
  onSelectScene,
}: UseStudioShortcutsOptions): void {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key;

      if (key === 'm' || key === 'M') {
        event.preventDefault();
        onToggleTaskbar();
        return;
      }

      if (key >= '1' && key <= '9' && availableScenes.length > 0) {
        const digit = Number(key);
        const sceneIndex = (digit - 1) % availableScenes.length;
        const targetScene = availableScenes[sceneIndex];
        if (targetScene !== undefined) {
          event.preventDefault();
          onSelectScene(targetScene);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, availableScenes, onToggleTaskbar, onSelectScene]);
}
