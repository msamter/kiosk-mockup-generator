import {
  BezelFinishId,
  SCENE_FRAME_COUNTS,
  StudioPageId,
} from '../types/studio';
import { normalizeAndValidateUrl } from './urlValidation';

const STORAGE_SCHEMA_VERSION = 2;
const STUDIO_SETTINGS_KEY = 'kiosk:studio-settings:v2';
const LEGACY_STUDIO_SETTINGS_KEY = 'mobile-showcase-studio-settings-v1';
const STUDIO_SCALE_KEY = 'kiosk:studio-scale:v2';
const LEGACY_STUDIO_SCALE_KEY = 'mobile-showcase-studio-scale-v1';
const STUDIO_RECENT_URLS_KEY = 'kiosk:recent-urls:v1';

const MAX_RECENT_URLS = 5;
const SETTINGS_SAVE_DEBOUNCE_MS = 180;

const VALID_BEZEL_FINISHES = new Set<BezelFinishId>(['black', 'grey', 'silver']);

export interface PersistedStudioSettings {
  activeScene: StudioPageId;
  backgroundTone: number;
  isTransparentBackdrop: boolean;
  showBezel: boolean;
  bezelFinish: BezelFinishId;
  customUrl: string | null;
}

export interface RecentUrlEntry {
  url: string;
  displayHost: string;
}

interface VersionedSettingsPayload extends PersistedStudioSettings {
  schemaVersion: number;
}

export const DEFAULT_STUDIO_SETTINGS: PersistedStudioSettings = {
  activeScene: 1,
  backgroundTone: 0,
  isTransparentBackdrop: false,
  showBezel: true,
  bezelFinish: 'black',
  customUrl: null,
};

let pendingSettingsTimer: number | null = null;
let pendingSettingsSnapshot: PersistedStudioSettings | null = null;

function sanitizeSettings(raw: unknown): PersistedStudioSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_STUDIO_SETTINGS };
  }

  const parsed = raw as Partial<PersistedStudioSettings>;

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
    // Strictly reject temporary blob: URLs or unsafe schemes before hydrating state
    if (!parsed.customUrl.trim().toLowerCase().startsWith('blob:')) {
      const validated = normalizeAndValidateUrl(parsed.customUrl);
      if (validated.ok) {
        customUrl = validated.url;
      }
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
}

function safeReadStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWriteStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota or sandboxed iframe access errors cleanly
  }
}

function safeRemoveStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage access errors cleanly
  }
}

export function loadStudioSettings(): PersistedStudioSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_STUDIO_SETTINGS };
  }

  try {
    const raw =
      safeReadStorage(STUDIO_SETTINGS_KEY) ?? safeReadStorage(LEGACY_STUDIO_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_STUDIO_SETTINGS };

    const parsed: unknown = JSON.parse(raw);
    return sanitizeSettings(parsed);
  } catch {
    return { ...DEFAULT_STUDIO_SETTINGS };
  }
}

export function saveStudioSettings(settings: PersistedStudioSettings): void {
  const sanitized = sanitizeSettings(settings);
  const payload: VersionedSettingsPayload = {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    ...sanitized,
  };
  safeWriteStorage(STUDIO_SETTINGS_KEY, JSON.stringify(payload));
}

export function scheduleSaveStudioSettings(settings: PersistedStudioSettings): void {
  if (typeof window === 'undefined') return;
  pendingSettingsSnapshot = sanitizeSettings(settings);
  if (pendingSettingsTimer !== null) {
    window.clearTimeout(pendingSettingsTimer);
  }
  pendingSettingsTimer = window.setTimeout(() => {
    pendingSettingsTimer = null;
    if (pendingSettingsSnapshot) {
      saveStudioSettings(pendingSettingsSnapshot);
      pendingSettingsSnapshot = null;
    }
  }, SETTINGS_SAVE_DEBOUNCE_MS);
}

export function flushScheduledStudioSettings(): void {
  if (typeof window === 'undefined') return;
  if (pendingSettingsTimer !== null) {
    window.clearTimeout(pendingSettingsTimer);
    pendingSettingsTimer = null;
  }
  if (pendingSettingsSnapshot) {
    saveStudioSettings(pendingSettingsSnapshot);
    pendingSettingsSnapshot = null;
  }
}

export function loadPersistedScalePercent(): number {
  if (typeof window === 'undefined') return 100;
  try {
    const raw = safeReadStorage(STUDIO_SCALE_KEY) ?? safeReadStorage(LEGACY_STUDIO_SCALE_KEY);
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
  if (!Number.isFinite(scalePercent)) return;
  const clamped = Math.max(75, Math.min(110, Math.round(scalePercent)));
  safeWriteStorage(STUDIO_SCALE_KEY, String(clamped));
}

export function loadRecentUrls(): RecentUrlEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = safeReadStorage(STUDIO_RECENT_URLS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seen = new Set<string>();
    const valid: RecentUrlEntry[] = [];

    for (const item of parsed) {
      const candidate =
        typeof item === 'string'
          ? item
          : item && typeof item === 'object' && typeof (item as { url?: unknown }).url === 'string'
            ? (item as { url: string }).url
            : null;

      if (!candidate || candidate.trim().toLowerCase().startsWith('blob:')) {
        continue;
      }

      const validated = normalizeAndValidateUrl(candidate);
      if (validated.ok && !seen.has(validated.url)) {
        seen.add(validated.url);
        valid.push({
          url: validated.url,
          displayHost: validated.displayHost,
        });
        if (valid.length >= MAX_RECENT_URLS) break;
      }
    }

    return valid;
  } catch {
    return [];
  }
}

export function recordRecentUrl(rawUrl: string): RecentUrlEntry[] {
  const validated = normalizeAndValidateUrl(rawUrl);
  if (!validated.ok) {
    return loadRecentUrls();
  }

  const existing = loadRecentUrls().filter((entry) => entry.url !== validated.url);
  const next: RecentUrlEntry[] = [
    { url: validated.url, displayHost: validated.displayHost },
    ...existing,
  ].slice(0, MAX_RECENT_URLS);

  safeWriteStorage(STUDIO_RECENT_URLS_KEY, JSON.stringify(next));
  return next;
}

export function removeRecentUrl(targetUrl: string): RecentUrlEntry[] {
  const next = loadRecentUrls().filter((entry) => entry.url !== targetUrl);
  safeWriteStorage(STUDIO_RECENT_URLS_KEY, JSON.stringify(next));
  return next;
}

/**
 * Clears all persisted Kiosk preferences and recent URLs cleanly for recovery or reset flows.
 */
export function resetStudioStorage(): void {
  if (typeof window !== 'undefined' && pendingSettingsTimer !== null) {
    window.clearTimeout(pendingSettingsTimer);
    pendingSettingsTimer = null;
  }
  pendingSettingsSnapshot = null;
  safeRemoveStorage(STUDIO_SETTINGS_KEY);
  safeRemoveStorage(LEGACY_STUDIO_SETTINGS_KEY);
  safeRemoveStorage(STUDIO_SCALE_KEY);
  safeRemoveStorage(LEGACY_STUDIO_SCALE_KEY);
  safeRemoveStorage(STUDIO_RECENT_URLS_KEY);
}
