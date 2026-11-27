import {
  BezelFinishId,
  SCENE_FRAME_COUNTS,
  StudioPageId,
} from '../types/studio';
import { normalizeAndValidateUrl } from './urlValidation';

const STUDIO_SETTINGS_KEY = 'mobile-showcase-studio-settings-v1';
const STUDIO_SCALE_KEY = 'mobile-showcase-studio-scale-v1';

const VALID_BEZEL_FINISHES = new Set<BezelFinishId>(['black', 'grey', 'silver']);

export interface PersistedStudioSettings {
  activeScene: StudioPageId;
  backgroundTone: number;
  isTransparentBackdrop: boolean;
  showBezel: boolean;
  bezelFinish: BezelFinishId;
  customUrl: string | null;
}

const DEFAULT_STUDIO_SETTINGS: PersistedStudioSettings = {
  activeScene: 1,
  backgroundTone: 0,
  isTransparentBackdrop: false,
  showBezel: true,
  bezelFinish: 'black',
  customUrl: null,
};

export function loadStudioSettings(): PersistedStudioSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_STUDIO_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STUDIO_SETTINGS_KEY);
    if (!raw) return DEFAULT_STUDIO_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<PersistedStudioSettings> | null;
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_STUDIO_SETTINGS;
    }

    const activeScene = SCENE_FRAME_COUNTS.includes(parsed.activeScene as StudioPageId)
      ? (parsed.activeScene as StudioPageId)
      : DEFAULT_STUDIO_SETTINGS.activeScene;

    const backgroundTone =
      typeof parsed.backgroundTone === 'number' && Number.isFinite(parsed.backgroundTone)
        ? Math.max(0, Math.min(100, Math.round(parsed.backgroundTone)))
        : DEFAULT_STUDIO_SETTINGS.backgroundTone;

    const isTransparentBackdrop =
      typeof parsed.isTransparentBackdrop === 'boolean'
        ? parsed.isTransparentBackdrop
        : DEFAULT_STUDIO_SETTINGS.isTransparentBackdrop;

    const showBezel =
      typeof parsed.showBezel === 'boolean'
        ? parsed.showBezel
        : DEFAULT_STUDIO_SETTINGS.showBezel;

    const bezelFinish = VALID_BEZEL_FINISHES.has(parsed.bezelFinish as BezelFinishId)
      ? (parsed.bezelFinish as BezelFinishId)
      : DEFAULT_STUDIO_SETTINGS.bezelFinish;

    let customUrl: string | null = null;
    if (typeof parsed.customUrl === 'string' && parsed.customUrl.trim().length > 0) {
      const validated = normalizeAndValidateUrl(parsed.customUrl);
      if (validated.ok) {
        customUrl = validated.url;
      }
    }

    return {
      activeScene,
      backgroundTone,
      isTransparentBackdrop,
      showBezel,
      bezelFinish,
      customUrl,
    };
  } catch {
    return DEFAULT_STUDIO_SETTINGS;
  }
}

export function saveStudioSettings(settings: PersistedStudioSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota or sandboxed iframe access errors cleanly
  }
}

export function loadPersistedScalePercent(): number {
  if (typeof window === 'undefined') return 100;
  try {
    const raw = window.localStorage.getItem(STUDIO_SCALE_KEY);
    if (!raw) return 100;
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return Math.max(75, Math.min(110, Math.round(parsed)));
    }
    return 100;
  } catch {
    return 100;
  }
}

export function savePersistedScalePercent(scalePercent: number): void {
  if (typeof window === 'undefined') return;
  try {
    const clamped = Math.max(75, Math.min(110, Math.round(scalePercent)));
    window.localStorage.setItem(STUDIO_SCALE_KEY, String(clamped));
  } catch {
    // Ignore storage quota or sandboxed iframe access errors cleanly
  }
}
