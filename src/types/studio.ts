export type BezelFinishId = 'black' | 'grey' | 'silver';
export type StudioThemeId =
  | 'grid'
  | 'angles'
  | 'charisma'
  | 'wave'
  | 'dynamic'
  | 'terminal'
  | 'scribe'
  | 'hourglass'
  | 'live-action';
export type GridSceneId = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
export type AngleSceneId =
  | 'peek'
  | 'offset'
  | 'slant'
  | 'cascade'
  | 'quad'
  | 'masonry'
  | 'tilt-right'
  | 'tilt-left';
export type CharismaSceneId = 'duo' | 'fan' | 'sway' | 'sway-5' | 'sway-6';
export type WaveSceneId = 'wave-2' | 'wave-3' | 'wave' | 'wave-6' | 'wave-8' | 'wave-12';
export type DynamicSceneId =
  | 'dynamic-1'
  | 'dynamic-3'
  | 'dynamic-4'
  | 'dynamic-5'
  | 'dynamic-8'
  | 'dynamic-9'
  | 'dynamic-12'
  | 'dynamic-14';
export type TerminalSceneId = 'desktop' | 'macbook' | 'ultrawide' | 'browser';
export type ScribeSceneId =
  | 'tablet-1'
  | 'tablet-2'
  | 'tablet-mini'
  | 'tablet-pro'
  | 'tablet-wide'
  | 'tablet-pair';
export type HourglassSceneId =
  | 'watch-1'
  | 'watch-3'
  | 'watch-4'
  | 'watch-6'
  | 'apple-watch-1'
  | 'apple-watch-3'
  | 'apple-watch-4'
  | 'apple-watch-6';
export type LiveActionSceneId =
  | 'live-oak'
  | 'live-stand'
  | 'live-audio'
  | 'live-tile'
  | 'live-tufted'
  | 'live-draped'
  | 'live-table'
  | 'live-grip';
export type StudioPageId =
  | GridSceneId
  | AngleSceneId
  | CharismaSceneId
  | WaveSceneId
  | DynamicSceneId
  | TerminalSceneId
  | ScribeSceneId
  | HourglassSceneId
  | LiveActionSceneId;

export const GRID_SCENES: readonly GridSceneId[] = [1, 2, 3, 4, 6, 8, 12, 16] as const;
export const ANGLE_SCENES: readonly AngleSceneId[] = [
  'peek',
  'offset',
  'slant',
  'cascade',
  'quad',
  'masonry',
  'tilt-right',
  'tilt-left',
] as const;
export const CHARISMA_SCENES: readonly CharismaSceneId[] = [
  'duo',
  'fan',
  'sway',
  'sway-5',
  'sway-6',
] as const;
export const WAVE_SCENES: readonly WaveSceneId[] = [
  'wave-2',
  'wave-3',
  'wave',
  'wave-6',
  'wave-8',
  'wave-12',
] as const;
export const DYNAMIC_SCENES: readonly DynamicSceneId[] = [
  'dynamic-1',
  'dynamic-8',
  'dynamic-14',
  'dynamic-12',
  'dynamic-3',
  'dynamic-9',
  'dynamic-4',
  'dynamic-5',
] as const;
export const TERMINAL_SCENES: readonly TerminalSceneId[] = [
  'desktop',
  'macbook',
  'ultrawide',
  'browser',
] as const;
export const SCRIBE_SCENES: readonly ScribeSceneId[] = [
  'tablet-1',
  'tablet-2',
  'tablet-mini',
  'tablet-pro',
  'tablet-wide',
  'tablet-pair',
] as const;
export const HOURGLASS_SCENES: readonly HourglassSceneId[] = [
  'watch-1',
  'watch-3',
  'watch-4',
  'watch-6',
  'apple-watch-1',
  'apple-watch-3',
  'apple-watch-4',
  'apple-watch-6',
] as const;
export const LIVE_ACTION_SCENES: readonly LiveActionSceneId[] = [
  'live-grip',
  'live-table',
  'live-tile',
  'live-tufted',
  'live-draped',
  'live-audio',
  'live-stand',
  'live-oak',
] as const;

export const SCENE_FRAME_COUNTS: readonly StudioPageId[] = [
  ...GRID_SCENES,
  ...ANGLE_SCENES,
  ...CHARISMA_SCENES,
  ...WAVE_SCENES,
  ...DYNAMIC_SCENES,
  ...TERMINAL_SCENES,
  ...SCRIBE_SCENES,
  ...HOURGLASS_SCENES,
  ...LIVE_ACTION_SCENES,
] as const;

export const THEME_SCENES: Record<StudioThemeId, readonly StudioPageId[]> = {
  grid: GRID_SCENES,
  angles: ANGLE_SCENES,
  charisma: CHARISMA_SCENES,
  wave: WAVE_SCENES,
  dynamic: DYNAMIC_SCENES,
  terminal: TERMINAL_SCENES,
  scribe: SCRIBE_SCENES,
  hourglass: HOURGLASS_SCENES,
  'live-action': LIVE_ACTION_SCENES,
};

export interface StudioThemeConfig {
  id: StudioThemeId;
  label: string;
  description: string;
}

export const STUDIO_THEMES: readonly StudioThemeConfig[] = [
  {
    id: 'grid',
    label: 'Grid',
    description: '1, 2, 3, 4, 6, 8, 12, 16',
  },
  {
    id: 'angles',
    label: 'Angles',
    description: '8 editorial layouts',
  },
  {
    id: 'charisma',
    label: 'Stack',
    description: '5 overlapping layouts',
  },
  {
    id: 'wave',
    label: 'Wave',
    description: '6 wave layouts',
  },
  {
    id: 'dynamic',
    label: 'Dynamic',
    description: '8 3D studio angles',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    description: '4 desktop mockups',
  },
  {
    id: 'scribe',
    label: 'Scribe',
    description: '6 tablet mockups',
  },
  {
    id: 'hourglass',
    label: 'Hourglass',
    description: '8 smartwatch layouts',
  },
  {
    id: 'live-action',
    label: 'Live Action',
    description: '8 photorealistic scenes',
  },
] as const;

const ANGLE_SCENE_SET = new Set<string>(ANGLE_SCENES);
const CHARISMA_SCENE_SET = new Set<string>(CHARISMA_SCENES);
const WAVE_SCENE_SET = new Set<string>(WAVE_SCENES);
const DYNAMIC_SCENE_SET = new Set<string>(DYNAMIC_SCENES);
const TERMINAL_SCENE_SET = new Set<string>(TERMINAL_SCENES);
const SCRIBE_SCENE_SET = new Set<string>(SCRIBE_SCENES);
const HOURGLASS_SCENE_SET = new Set<string>(HOURGLASS_SCENES);
const LIVE_ACTION_SCENE_SET = new Set<string>(LIVE_ACTION_SCENES);

export function isAngleScene(scene: StudioPageId): scene is AngleSceneId {
  return typeof scene === 'string' && ANGLE_SCENE_SET.has(scene);
}

export function isCharismaScene(scene: StudioPageId): scene is CharismaSceneId {
  return typeof scene === 'string' && CHARISMA_SCENE_SET.has(scene);
}

export function isWaveScene(scene: StudioPageId): scene is WaveSceneId {
  return typeof scene === 'string' && WAVE_SCENE_SET.has(scene);
}

export function isDynamicScene(scene: StudioPageId): scene is DynamicSceneId {
  return typeof scene === 'string' && DYNAMIC_SCENE_SET.has(scene);
}

export function isTerminalScene(scene: StudioPageId): scene is TerminalSceneId {
  return typeof scene === 'string' && TERMINAL_SCENE_SET.has(scene);
}

export function isScribeScene(scene: StudioPageId): scene is ScribeSceneId {
  return typeof scene === 'string' && SCRIBE_SCENE_SET.has(scene);
}

export function isHourglassScene(scene: StudioPageId): scene is HourglassSceneId {
  return typeof scene === 'string' && HOURGLASS_SCENE_SET.has(scene);
}

export function isLiveActionScene(scene: StudioPageId): scene is LiveActionSceneId {
  return typeof scene === 'string' && LIVE_ACTION_SCENE_SET.has(scene);
}

export function isGridScene(scene: StudioPageId): scene is GridSceneId {
  return typeof scene === 'number';
}

export function getThemeForScene(scene: StudioPageId): StudioThemeId {
  if (isAngleScene(scene)) return 'angles';
  if (isCharismaScene(scene)) return 'charisma';
  if (isWaveScene(scene)) return 'wave';
  if (isDynamicScene(scene)) return 'dynamic';
  if (isTerminalScene(scene)) return 'terminal';
  if (isScribeScene(scene)) return 'scribe';
  if (isHourglassScene(scene)) return 'hourglass';
  if (isLiveActionScene(scene)) return 'live-action';
  return 'grid';
}

export const SCENE_BUTTON_LABELS: Record<StudioPageId, string> = {
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  6: '6',
  8: '8',
  12: '12',
  16: '16',
  peek: '1',
  offset: '2',
  cascade: '3',
  quad: '4',
  masonry: '5',
  'tilt-right': '6R',
  'tilt-left': '6L',
  duo: '2',
  fan: '3',
  slant: '2L',
  sway: '4',
  'sway-5': '5',
  'sway-6': '6',
  'wave-2': '2',
  'wave-3': '3',
  wave: '4',
  'wave-6': '6',
  'wave-8': '8',
  'wave-12': '12',
  'dynamic-1': '1',
  'dynamic-8': '2',
  'dynamic-14': '3',
  'dynamic-12': '4',
  'dynamic-3': '5',
  'dynamic-9': '6',
  'dynamic-4': '7',
  'dynamic-5': '8',
  desktop: 'Desktop',
  macbook: 'MacBook',
  ultrawide: 'Ultrawide',
  browser: 'Browser',
  'tablet-1': '1',
  'tablet-2': '2',
  'tablet-mini': 'Mini',
  'tablet-pro': 'Pro 13"',
  'tablet-wide': 'Wide',
  'tablet-pair': 'Pair',
  'watch-1': '1',
  'watch-3': '3',
  'watch-4': '4',
  'watch-6': '6',
  'apple-watch-1': '1',
  'apple-watch-3': '3',
  'apple-watch-4': '4',
  'apple-watch-6': '6',
  'live-grip': '1',
  'live-table': '2',
  'live-tile': '3',
  'live-tufted': '4',
  'live-draped': '5',
  'live-audio': '6',
  'live-stand': '7',
  'live-oak': '8',
};

export const SCENE_VISIBLE_COUNTS: Record<StudioPageId, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  6: 6,
  8: 8,
  12: 12,
  16: 16,
  peek: 1,
  offset: 2,
  cascade: 3,
  quad: 4,
  masonry: 12,
  'tilt-right': 12,
  'tilt-left': 12,
  duo: 2,
  fan: 3,
  slant: 2,
  sway: 4,
  'sway-5': 5,
  'sway-6': 6,
  'wave-2': 2,
  'wave-3': 3,
  wave: 4,
  'wave-6': 6,
  'wave-8': 8,
  'wave-12': 12,
  'dynamic-1': 1,
  'dynamic-3': 2,
  'dynamic-4': 2,
  'dynamic-5': 2,
  'dynamic-8': 1,
  'dynamic-9': 2,
  'dynamic-12': 1,
  'dynamic-14': 1,
  desktop: 1,
  macbook: 1,
  ultrawide: 1,
  browser: 1,
  'tablet-1': 1,
  'tablet-2': 2,
  'tablet-mini': 1,
  'tablet-pro': 1,
  'tablet-wide': 1,
  'tablet-pair': 2,
  'watch-1': 1,
  'watch-3': 3,
  'watch-4': 4,
  'watch-6': 6,
  'apple-watch-1': 1,
  'apple-watch-3': 3,
  'apple-watch-4': 4,
  'apple-watch-6': 6,
  'live-oak': 1,
  'live-stand': 1,
  'live-audio': 1,
  'live-tile': 1,
  'live-tufted': 1,
  'live-draped': 1,
  'live-table': 1,
  'live-grip': 1,
};

export interface AngleColumnConfig {
  readonly frames: readonly number[];
  readonly offsetY: number;
}

export interface AngleSceneLayoutConfig {
  readonly rotateDeg: number;
  readonly columnGapClass: string;
  readonly rowGapClass: string;
  readonly columns: readonly AngleColumnConfig[];
}

export const ANGLE_SCENE_LAYOUTS: Record<AngleSceneId, AngleSceneLayoutConfig> = {
  peek: {
    rotateDeg: 0,
    columnGapClass: 'gap-0',
    rowGapClass: 'gap-0',
    columns: [{ frames: [1], offsetY: 225 }],
  },
  offset: {
    rotateDeg: 0,
    columnGapClass: 'gap-20',
    rowGapClass: 'gap-0',
    columns: [
      { frames: [1], offsetY: -65 },
      { frames: [2], offsetY: 245 },
    ],
  },
  cascade: {
    rotateDeg: 0,
    columnGapClass: 'gap-14',
    rowGapClass: 'gap-0',
    columns: [
      { frames: [1], offsetY: -64 },
      { frames: [2], offsetY: 0 },
      { frames: [3], offsetY: 64 },
    ],
  },
  quad: {
    rotateDeg: 26,
    columnGapClass: 'gap-16',
    rowGapClass: 'gap-16',
    columns: [
      { frames: [1, 2], offsetY: 155 },
      { frames: [3, 4], offsetY: -155 },
    ],
  },
  masonry: {
    rotateDeg: 0,
    columnGapClass: 'gap-14',
    rowGapClass: 'gap-14',
    columns: [
      { frames: [1, 2, 3], offsetY: -210 },
      { frames: [4, 5, 6], offsetY: 50 },
      { frames: [7, 8, 9], offsetY: -150 },
      { frames: [10, 11, 12], offsetY: 170 },
    ],
  },
  'tilt-right': {
    rotateDeg: 45,
    columnGapClass: 'gap-14',
    rowGapClass: 'gap-14',
    columns: [
      { frames: [1, 2, 3], offsetY: 260 },
      { frames: [4, 5, 6], offsetY: -180 },
      { frames: [7, 8, 9], offsetY: 180 },
      { frames: [10, 11, 12], offsetY: -260 },
    ],
  },
  'tilt-left': {
    rotateDeg: -45,
    columnGapClass: 'gap-14',
    rowGapClass: 'gap-14',
    columns: [
      { frames: [1, 2, 3], offsetY: -260 },
      { frames: [4, 5, 6], offsetY: 180 },
      { frames: [7, 8, 9], offsetY: -180 },
      { frames: [10, 11, 12], offsetY: 260 },
    ],
  },
  slant: {
    rotateDeg: -20,
    columnGapClass: 'gap-28',
    rowGapClass: 'gap-0',
    columns: [
      { frames: [1], offsetY: -42 },
      { frames: [2], offsetY: 42 },
    ],
  },
};

export interface CharismaFrameItem {
  readonly frame: number;
  readonly offsetY: number;
  readonly rotateDeg: number;
  readonly zIndex: number;
}

export interface CharismaSceneLayoutConfig {
  readonly itemGapPx: number;
  readonly rowGapPx?: number;
  readonly items: readonly CharismaFrameItem[];
  readonly rows?: readonly (readonly CharismaFrameItem[])[];
}

export const CHARISMA_SCENE_LAYOUTS: Record<CharismaSceneId, CharismaSceneLayoutConfig> = {
  duo: {
    itemGapPx: -26,
    items: [
      { frame: 1, offsetY: -8, rotateDeg: -7, zIndex: 20 },
      { frame: 2, offsetY: 10, rotateDeg: 9, zIndex: 10 },
    ],
  },
  fan: {
    itemGapPx: -48,
    items: [
      { frame: 1, offsetY: 12, rotateDeg: -15, zIndex: 30 },
      { frame: 2, offsetY: -14, rotateDeg: 5, zIndex: 20 },
      { frame: 3, offsetY: 12, rotateDeg: 13, zIndex: 10 },
    ],
  },
  sway: {
    itemGapPx: -48,
    items: [
      { frame: 1, offsetY: -66, rotateDeg: -7, zIndex: 40 },
      { frame: 2, offsetY: 12, rotateDeg: 5, zIndex: 30 },
      { frame: 3, offsetY: -22, rotateDeg: 0, zIndex: 20 },
      { frame: 4, offsetY: 48, rotateDeg: 9, zIndex: 10 },
    ],
  },
  'sway-5': {
    itemGapPx: -48,
    items: [
      { frame: 1, offsetY: -72, rotateDeg: -7, zIndex: 50 },
      { frame: 2, offsetY: 14, rotateDeg: 5, zIndex: 40 },
      { frame: 3, offsetY: -28, rotateDeg: -4, zIndex: 30 },
      { frame: 4, offsetY: 46, rotateDeg: 6, zIndex: 20 },
      { frame: 5, offsetY: -6, rotateDeg: -5, zIndex: 10 },
    ],
  },
  'sway-6': {
    itemGapPx: -48,
    items: [
      { frame: 1, offsetY: -74, rotateDeg: -7, zIndex: 60 },
      { frame: 2, offsetY: 12, rotateDeg: 5, zIndex: 50 },
      { frame: 3, offsetY: -34, rotateDeg: -4, zIndex: 40 },
      { frame: 4, offsetY: 38, rotateDeg: 5, zIndex: 30 },
      { frame: 5, offsetY: -12, rotateDeg: -2, zIndex: 20 },
      { frame: 6, offsetY: 56, rotateDeg: 9, zIndex: 10 },
    ],
  },
};

export const WAVE_SCENE_LAYOUTS: Record<WaveSceneId, CharismaSceneLayoutConfig> = {
  'wave-2': {
    itemGapPx: 56,
    items: [
      { frame: 1, offsetY: -64, rotateDeg: 0, zIndex: 10 },
      { frame: 2, offsetY: 64, rotateDeg: 0, zIndex: 10 },
    ],
  },
  'wave-3': {
    itemGapPx: 56,
    items: [
      { frame: 1, offsetY: 56, rotateDeg: 0, zIndex: 10 },
      { frame: 2, offsetY: -88, rotateDeg: 0, zIndex: 10 },
      { frame: 3, offsetY: 56, rotateDeg: 0, zIndex: 10 },
    ],
  },
  wave: {
    itemGapPx: 56,
    items: [
      { frame: 1, offsetY: -64, rotateDeg: 0, zIndex: 10 },
      { frame: 2, offsetY: 64, rotateDeg: 0, zIndex: 10 },
      { frame: 3, offsetY: -64, rotateDeg: 0, zIndex: 10 },
      { frame: 4, offsetY: 64, rotateDeg: 0, zIndex: 10 },
    ],
  },
  'wave-6': {
    itemGapPx: 52,
    items: [
      { frame: 1, offsetY: -56, rotateDeg: 0, zIndex: 10 },
      { frame: 2, offsetY: 72, rotateDeg: 0, zIndex: 10 },
      { frame: 3, offsetY: -116, rotateDeg: 0, zIndex: 10 },
      { frame: 4, offsetY: 52, rotateDeg: 0, zIndex: 10 },
      { frame: 5, offsetY: -68, rotateDeg: 0, zIndex: 10 },
      { frame: 6, offsetY: 96, rotateDeg: 0, zIndex: 10 },
    ],
  },
  'wave-8': {
    itemGapPx: 56,
    rowGapPx: 56,
    items: [],
    rows: [
      [
        { frame: 1, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 2, offsetY: 64, rotateDeg: 0, zIndex: 10 },
        { frame: 3, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 4, offsetY: 64, rotateDeg: 0, zIndex: 10 },
      ],
      [
        { frame: 5, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 6, offsetY: 64, rotateDeg: 0, zIndex: 10 },
        { frame: 7, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 8, offsetY: 64, rotateDeg: 0, zIndex: 10 },
      ],
    ],
  },
  'wave-12': {
    itemGapPx: 52,
    rowGapPx: 56,
    items: [],
    rows: [
      [
        { frame: 1, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 2, offsetY: 64, rotateDeg: 0, zIndex: 10 },
        { frame: 3, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 4, offsetY: 64, rotateDeg: 0, zIndex: 10 },
        { frame: 5, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 6, offsetY: 64, rotateDeg: 0, zIndex: 10 },
      ],
      [
        { frame: 7, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 8, offsetY: 64, rotateDeg: 0, zIndex: 10 },
        { frame: 9, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 10, offsetY: 64, rotateDeg: 0, zIndex: 10 },
        { frame: 11, offsetY: -64, rotateDeg: 0, zIndex: 10 },
        { frame: 12, offsetY: 64, rotateDeg: 0, zIndex: 10 },
      ],
    ],
  },
};

export interface TerminalSceneLayoutConfig {
  readonly formFactor: TerminalSceneId;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly aspectRatioLabel: string;
  readonly deviceName: string;
}

export const TERMINAL_SCENE_LAYOUTS: Record<TerminalSceneId, TerminalSceneLayoutConfig> = {
  desktop: {
    formFactor: 'desktop',
    screenWidth: 1280,
    screenHeight: 720,
    aspectRatioLabel: '16:9',
    deviceName: 'Desktop Monitor',
  },
  macbook: {
    formFactor: 'macbook',
    screenWidth: 1152,
    screenHeight: 720,
    aspectRatioLabel: '16:10',
    deviceName: 'MacBook Pro',
  },
  ultrawide: {
    formFactor: 'ultrawide',
    screenWidth: 1470,
    screenHeight: 630,
    aspectRatioLabel: '21:9',
    deviceName: 'Ultrawide Monitor',
  },
  browser: {
    formFactor: 'browser',
    screenWidth: 1080,
    screenHeight: 720,
    aspectRatioLabel: '3:2',
    deviceName: 'Desktop Browser',
  },
};

export type TabletSizeVariant =
  | 'standard'
  | 'mini'
  | 'pro-13'
  | 'ultra-wide'
  | 'pair-landscape'
  | 'pair-mini';

export interface TabletSizeSpec {
  readonly id: TabletSizeVariant;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly orientation: 'portrait' | 'landscape';
  readonly sizeLabel: string;
  readonly deviceName: string;
  readonly bezelPadPx: number;
  readonly outerRadiusPx: number;
  readonly innerRadiusPx: number;
  readonly screenRadiusPx: number;
}

export const TABLET_SIZE_SPECS: Record<TabletSizeVariant, TabletSizeSpec> = {
  standard: {
    id: 'standard',
    screenWidth: 768,
    screenHeight: 1024,
    orientation: 'portrait',
    sizeLabel: '11" · 3:4',
    deviceName: 'Tablet 11"',
    bezelPadPx: 16,
    outerRadiusPx: 38,
    innerRadiusPx: 34,
    screenRadiusPx: 20,
  },
  mini: {
    id: 'mini',
    screenWidth: 590,
    screenHeight: 900,
    orientation: 'portrait',
    sizeLabel: '8.3" · Mini',
    deviceName: 'Tablet Mini 8.3"',
    bezelPadPx: 14,
    outerRadiusPx: 32,
    innerRadiusPx: 28,
    screenRadiusPx: 16,
  },
  'pro-13': {
    id: 'pro-13',
    screenWidth: 1160,
    screenHeight: 870,
    orientation: 'landscape',
    sizeLabel: '13" · 4:3',
    deviceName: 'Pro Tablet 13"',
    bezelPadPx: 16,
    outerRadiusPx: 36,
    innerRadiusPx: 32,
    screenRadiusPx: 18,
  },
  'ultra-wide': {
    id: 'ultra-wide',
    screenWidth: 1280,
    screenHeight: 800,
    orientation: 'landscape',
    sizeLabel: '14.6" · 16:10',
    deviceName: 'Ultra Tablet 14.6"',
    bezelPadPx: 14,
    outerRadiusPx: 32,
    innerRadiusPx: 28,
    screenRadiusPx: 16,
  },
  'pair-landscape': {
    id: 'pair-landscape',
    screenWidth: 1040,
    screenHeight: 780,
    orientation: 'landscape',
    sizeLabel: '13" · 4:3',
    deviceName: 'Pro Tablet 13"',
    bezelPadPx: 16,
    outerRadiusPx: 36,
    innerRadiusPx: 32,
    screenRadiusPx: 18,
  },
  'pair-mini': {
    id: 'pair-mini',
    screenWidth: 520,
    screenHeight: 780,
    orientation: 'portrait',
    sizeLabel: '8.3" · Mini',
    deviceName: 'Tablet Mini 8.3"',
    bezelPadPx: 14,
    outerRadiusPx: 30,
    innerRadiusPx: 26,
    screenRadiusPx: 15,
  },
};

export interface ScribeTabletItem {
  readonly frame: number;
  readonly size: TabletSizeVariant;
}

export interface ScribeSceneLayoutConfig {
  readonly gapClass: string;
  readonly items: readonly ScribeTabletItem[];
}

export const SCRIBE_SCENE_LAYOUTS: Record<ScribeSceneId, ScribeSceneLayoutConfig> = {
  'tablet-1': {
    gapClass: 'gap-0',
    items: [{ frame: 1, size: 'standard' }],
  },
  'tablet-2': {
    gapClass: 'gap-12',
    items: [
      { frame: 1, size: 'standard' },
      { frame: 2, size: 'standard' },
    ],
  },
  'tablet-mini': {
    gapClass: 'gap-0',
    items: [{ frame: 1, size: 'mini' }],
  },
  'tablet-pro': {
    gapClass: 'gap-0',
    items: [{ frame: 1, size: 'pro-13' }],
  },
  'tablet-wide': {
    gapClass: 'gap-0',
    items: [{ frame: 1, size: 'ultra-wide' }],
  },
  'tablet-pair': {
    gapClass: 'gap-10',
    items: [
      { frame: 1, size: 'pair-landscape' },
      { frame: 2, size: 'pair-mini' },
    ],
  },
};

export type WatchHardwareModel = 'pixel' | 'apple';

export interface HourglassSceneLayoutConfig {
  readonly model: WatchHardwareModel;
  readonly containerClass: string;
  readonly screenWidthPx: number;
  readonly screenHeightPx: number;
  readonly screenRadiusPx: number;
  readonly bezelPadPx: number;
  readonly showStraps: boolean;
  readonly strapLengthPx: number;
  readonly frames: readonly number[];
}

export const HOURGLASS_SCENE_LAYOUTS: Record<HourglassSceneId, HourglassSceneLayoutConfig> = {
  'watch-1': {
    model: 'pixel',
    containerClass: 'flex items-center justify-center',
    screenWidthPx: 460,
    screenHeightPx: 460,
    screenRadiusPx: 9999,
    bezelPadPx: 20,
    showStraps: true,
    strapLengthPx: 146,
    frames: [1],
  },
  'watch-3': {
    model: 'pixel',
    containerClass: 'flex flex-row items-center justify-center gap-12',
    screenWidthPx: 360,
    screenHeightPx: 360,
    screenRadiusPx: 9999,
    bezelPadPx: 17,
    showStraps: true,
    strapLengthPx: 112,
    frames: [1, 2, 3],
  },
  'watch-4': {
    model: 'pixel',
    containerClass: 'flex flex-row items-center justify-center gap-10',
    screenWidthPx: 330,
    screenHeightPx: 330,
    screenRadiusPx: 9999,
    bezelPadPx: 16,
    showStraps: true,
    strapLengthPx: 102,
    frames: [1, 2, 3, 4],
  },
  'watch-6': {
    model: 'pixel',
    containerClass: 'grid grid-cols-[repeat(3,max-content)] gap-8 items-center justify-items-center',
    screenWidthPx: 340,
    screenHeightPx: 340,
    screenRadiusPx: 9999,
    bezelPadPx: 16,
    showStraps: false,
    strapLengthPx: 0,
    frames: [1, 2, 3, 4, 5, 6],
  },
  'apple-watch-1': {
    model: 'apple',
    containerClass: 'flex items-center justify-center',
    screenWidthPx: 396,
    screenHeightPx: 484,
    screenRadiusPx: 88,
    bezelPadPx: 20,
    showStraps: true,
    strapLengthPx: 138,
    frames: [1],
  },
  'apple-watch-3': {
    model: 'apple',
    containerClass: 'flex flex-row items-center justify-center gap-12',
    screenWidthPx: 310,
    screenHeightPx: 380,
    screenRadiusPx: 68,
    bezelPadPx: 16,
    showStraps: true,
    strapLengthPx: 104,
    frames: [1, 2, 3],
  },
  'apple-watch-4': {
    model: 'apple',
    containerClass: 'flex flex-row items-center justify-center gap-10',
    screenWidthPx: 284,
    screenHeightPx: 348,
    screenRadiusPx: 62,
    bezelPadPx: 15,
    showStraps: true,
    strapLengthPx: 94,
    frames: [1, 2, 3, 4],
  },
  'apple-watch-6': {
    model: 'apple',
    containerClass: 'grid grid-cols-[repeat(3,max-content)] gap-8 items-center justify-items-center',
    screenWidthPx: 292,
    screenHeightPx: 356,
    screenRadiusPx: 64,
    bezelPadPx: 15,
    showStraps: false,
    strapLengthPx: 0,
    frames: [1, 2, 3, 4, 5, 6],
  },
};

export const SCENE_FRAME_INDICES: Record<StudioPageId, readonly number[]> = {
  1: [1],
  2: [1, 2],
  3: [1, 2, 3],
  4: [1, 2, 3, 4],
  6: [1, 2, 3, 4, 5, 6],
  8: [1, 2, 3, 4, 5, 6, 7, 8],
  12: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  16: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  peek: [1],
  offset: [1, 2],
  cascade: [1, 2, 3],
  quad: [1, 2, 3, 4],
  masonry: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'tilt-right': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'tilt-left': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  duo: [1, 2],
  fan: [1, 2, 3],
  slant: [1, 2],
  sway: [1, 2, 3, 4],
  'sway-5': [1, 2, 3, 4, 5],
  'sway-6': [1, 2, 3, 4, 5, 6],
  'wave-2': [1, 2],
  'wave-3': [1, 2, 3],
  wave: [1, 2, 3, 4],
  'wave-6': [1, 2, 3, 4, 5, 6],
  'wave-8': [1, 2, 3, 4, 5, 6, 7, 8],
  'wave-12': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'dynamic-1': [1],
  'dynamic-3': [1, 2],
  'dynamic-4': [1, 2],
  'dynamic-5': [1, 2],
  'dynamic-8': [1],
  'dynamic-9': [1, 2],
  'dynamic-12': [1],
  'dynamic-14': [1],
  desktop: [1],
  macbook: [1],
  ultrawide: [1],
  browser: [1],
  'tablet-1': [1],
  'tablet-2': [1, 2],
  'tablet-mini': [1],
  'tablet-pro': [1],
  'tablet-wide': [1],
  'tablet-pair': [1, 2],
  'watch-1': [1],
  'watch-3': [1, 2, 3],
  'watch-4': [1, 2, 3, 4],
  'watch-6': [1, 2, 3, 4, 5, 6],
  'apple-watch-1': [1],
  'apple-watch-3': [1, 2, 3],
  'apple-watch-4': [1, 2, 3, 4],
  'apple-watch-6': [1, 2, 3, 4, 5, 6],
  'live-oak': [1],
  'live-stand': [1],
  'live-audio': [1],
  'live-tile': [1],
  'live-tufted': [1],
  'live-draped': [1],
  'live-table': [1],
  'live-grip': [1],
};

export const SCENE_STAGE_LABELS: Record<StudioPageId, string> = {
  1: 'Single smartphone showcase',
  2: '2-screen side-by-side mobile showcase',
  3: '3-screen side-by-side mobile showcase',
  4: '4-screen mobile lineup showcase',
  6: '6-screen mobile lineup showcase',
  8: '8-screen 2 by 4 mobile grid showcase',
  12: '12-screen 2 by 6 mobile grid showcase',
  16: '16-screen 2 by 8 mobile grid showcase',
  peek: 'Angles 1 — single hero bottom-crop showcase',
  offset: 'Angles 2 — 2-screen staggered split showcase',
  cascade: 'Angles 3 — 3-screen descending staircase showcase',
  quad: 'Angles 4 — 4-screen 26-degree angled showcase',
  masonry: 'Angles 5 — 4-column staggered showcase wall',
  'tilt-right': 'Angles 6R — 45-degree clockwise brick mosaic',
  'tilt-left': 'Angles 6L — 45-degree counter-clockwise brick mosaic',
  duo: 'Stack 2 — 2-screen opposing V-fan showcase',
  fan: 'Stack 3 — 3-screen radiating spread showcase',
  slant: 'Angles 2L — 2-screen parallel tilted showcase',
  sway: 'Stack 4 — 4-screen alternating tilt ribbon showcase',
  'sway-5': 'Stack 5 — 5-screen overlapping alternating tilt ribbon showcase',
  'sway-6': 'Stack 6 — 6-screen overlapping alternating tilt ribbon showcase',
  'wave-2': 'Wave 2 — 2-screen staggered high-low wave showcase',
  'wave-3': 'Wave 3 — 3-screen cresting center-peak wave showcase',
  wave: 'Wave 4 — 4-screen alternating high-low wave showcase',
  'wave-6': 'Wave 6 — 6-screen sweeping crest-and-trough wave showcase',
  'wave-8': 'Wave 8 — 8-screen 2 by 4 alternating wave showcase',
  'wave-12': 'Wave 12 — 12-screen 2 by 6 alternating wave showcase',
  'dynamic-1': 'Dynamic 1 — single 3D angled upright smartphone showcase',
  'dynamic-8': 'Dynamic 2 — single dramatically tilted 3D floating smartphone',
  'dynamic-14': 'Dynamic 3 — single counter-clockwise 3D angled smartphone showcase',
  'dynamic-12': 'Dynamic 4 — single low-angle 3/4 floating smartphone showcase',
  'dynamic-3': 'Dynamic 5 — two counter-tilted overlapping floating smartphones',
  'dynamic-9': 'Dynamic 6 — two parallel upright 3/4 overlapping smartphones',
  'dynamic-4': 'Dynamic 7 — two parallel diagonally stepped floating smartphones',
  'dynamic-5': 'Dynamic 8 — two opposing 3D V-turned floating smartphones',
  desktop: 'Desktop 16:9 studio monitor showcase',
  macbook: 'MacBook 16:10 laptop showcase',
  ultrawide: 'Ultrawide 21:9 panoramic display showcase',
  browser: 'Browser 3:2 desktop window showcase',
  'tablet-1': 'Single 11-inch portrait tablet showcase',
  'tablet-2': '2 side-by-side 11-inch portrait tablets showcase',
  'tablet-mini': 'Compact 8.3-inch mini tablet showcase',
  'tablet-pro': '13-inch pro landscape tablet showcase',
  'tablet-wide': '14.6-inch 16:10 ultra-wide tablet showcase',
  'tablet-pair': 'Mixed-size 13-inch landscape and 8.3-inch mini tablet pair',
  'watch-1': 'Single large Pixel Watch showcase',
  'watch-3': '3 Pixel Watch screens side-by-side showcase',
  'watch-4': '4 Pixel Watch screens side-by-side showcase',
  'watch-6': '6 Pixel Watch screens close-knit 2 by 3 grid showcase',
  'apple-watch-1': 'Single large Apple Watch showcase',
  'apple-watch-3': '3 Apple Watch screens side-by-side showcase',
  'apple-watch-4': '4 Apple Watch screens side-by-side showcase',
  'apple-watch-6': '6 Apple Watch screens close-knit 2 by 3 grid showcase',
  'live-grip': 'Live Action 1 — editorial studio silhouette hand gripping upright smartphone',
  'live-table': 'Live Action 2 — angled smartphone on matte charcoal architectural side table',
  'live-tile': 'Live Action 3 — monochrome diagonal smartphone on matte charcoal concrete tiles',
  'live-tufted': 'Live Action 4 — monochrome smartphone resting on plush tufted charcoal velvet cushion',
  'live-draped': 'Live Action 5 — monochrome angled smartphone on sculpted charcoal linen ripples',
  'live-audio': 'Live Action 6 — upright smartphone paired with wireless earbuds on dark walnut wood',
  'live-stand': 'Live Action 7 — smartphone cradled in travertine marble desk stand',
  'live-oak': 'Live Action 8 — angled smartphone on sunlit natural oak table corner',
};

export const SCENE_LAYOUT_CLASSES: Record<StudioPageId, string> = {
  1: 'flex flex-row items-center justify-center gap-6',
  2: 'flex flex-row items-center justify-center gap-6',
  3: 'flex flex-row items-center justify-center gap-6',
  4: 'flex flex-row items-center justify-center gap-6',
  6: 'flex flex-row items-center justify-center gap-6',
  8: 'grid grid-cols-[repeat(4,max-content)] gap-6 items-center justify-items-center',
  12: 'grid grid-cols-[repeat(6,max-content)] gap-12 items-center justify-items-center',
  16: 'grid grid-cols-[repeat(8,max-content)] gap-12 items-center justify-items-center',
  peek: 'flex items-center justify-center',
  offset: 'flex items-center justify-center',
  cascade: 'flex items-center justify-center',
  quad: 'flex items-center justify-center',
  masonry: 'flex items-center justify-center',
  'tilt-right': 'flex items-center justify-center',
  'tilt-left': 'flex items-center justify-center',
  duo: 'flex items-center justify-center',
  fan: 'flex items-center justify-center',
  slant: 'flex items-center justify-center',
  sway: 'flex items-center justify-center',
  'sway-5': 'flex items-center justify-center',
  'sway-6': 'flex items-center justify-center',
  'wave-2': 'flex items-center justify-center',
  'wave-3': 'flex items-center justify-center',
  wave: 'flex items-center justify-center',
  'wave-6': 'flex items-center justify-center',
  'wave-8': 'flex items-center justify-center',
  'wave-12': 'flex items-center justify-center',
  'dynamic-1': 'flex items-center justify-center',
  'dynamic-3': 'flex items-center justify-center',
  'dynamic-4': 'flex items-center justify-center',
  'dynamic-5': 'flex items-center justify-center',
  'dynamic-8': 'flex items-center justify-center',
  'dynamic-9': 'flex items-center justify-center',
  'dynamic-12': 'flex items-center justify-center',
  'dynamic-14': 'flex items-center justify-center',
  desktop: 'flex items-center justify-center',
  macbook: 'flex items-center justify-center',
  ultrawide: 'flex items-center justify-center',
  browser: 'flex items-center justify-center',
  'tablet-1': 'flex items-center justify-center',
  'tablet-2': 'flex items-center justify-center',
  'tablet-mini': 'flex items-center justify-center',
  'tablet-pro': 'flex items-center justify-center',
  'tablet-wide': 'flex items-center justify-center',
  'tablet-pair': 'flex items-center justify-center',
  'watch-1': 'flex items-center justify-center',
  'watch-3': 'flex items-center justify-center',
  'watch-4': 'flex items-center justify-center',
  'watch-6': 'flex items-center justify-center',
  'apple-watch-1': 'flex items-center justify-center',
  'apple-watch-3': 'flex items-center justify-center',
  'apple-watch-4': 'flex items-center justify-center',
  'apple-watch-6': 'flex items-center justify-center',
  'live-oak': 'flex items-center justify-center',
  'live-stand': 'flex items-center justify-center',
  'live-audio': 'flex items-center justify-center',
  'live-tile': 'flex items-center justify-center',
  'live-tufted': 'flex items-center justify-center',
  'live-draped': 'flex items-center justify-center',
  'live-table': 'flex items-center justify-center',
  'live-grip': 'flex items-center justify-center',
};

export interface BezelFinishConfig {
  id: BezelFinishId;
  label: string;
  swatchColor: string;
  swatchRim: string;
  chassisGradient: string;
  rimHighlight: string;
  buttonColor: string;
  buttonHighlight: string;
  speakerColor: string;
}

export interface BackgroundPreset {
  id: string;
  label: string;
  tone: number;
  swatchColor: string;
  swatchRim: string;
}

export interface StudioToast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
}

export const BACKGROUND_PRESETS: readonly BackgroundPreset[] = [
  {
    id: 'dark-black',
    label: 'Black',
    tone: 0,
    swatchColor: '#111113',
    swatchRim: '#2E2E32',
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    tone: 24,
    swatchColor: '#424246',
    swatchRim: '#626268',
  },
  {
    id: 'mid-grey',
    label: 'Mid Grey',
    tone: 60,
    swatchColor: '#949498',
    swatchRim: '#B4B4B9',
  },
  {
    id: 'silver',
    label: 'Silver',
    tone: 88,
    swatchColor: '#C9CACF',
    swatchRim: '#E4E6EA',
  },
];

export const BEZEL_FINISHES: Record<BezelFinishId, BezelFinishConfig> = {
  black: {
    id: 'black',
    label: 'Black',
    swatchColor: '#111113',
    swatchRim: '#2C2C30',
    chassisGradient:
      'linear-gradient(145deg, #222226 0%, #131316 34%, #0E0E10 68%, #1C1C20 100%)',
    rimHighlight: '#27272B',
    buttonColor: '#19191C',
    buttonHighlight: 'rgba(255, 255, 255, 0.14)',
    speakerColor: '#050506',
  },
  grey: {
    id: 'grey',
    label: 'Grey',
    swatchColor: '#5A5B60',
    swatchRim: '#75777D',
    chassisGradient:
      'linear-gradient(145deg, #75777D 0%, #5E5F64 35%, #4B4C51 70%, #6A6B70 100%)',
    rimHighlight: '#75777D',
    buttonColor: '#636469',
    buttonHighlight: 'rgba(255, 255, 255, 0.24)',
    speakerColor: '#1E1E21',
  },
  silver: {
    id: 'silver',
    label: 'Silver',
    swatchColor: '#C8CACF',
    swatchRim: '#E4E6EA',
    chassisGradient:
      'linear-gradient(145deg, #E8EAEE 0%, #CFD1D6 32%, #B2B4BA 68%, #DFE1E5 100%)',
    rimHighlight: '#E4E6EA',
    buttonColor: '#CFD1D6',
    buttonHighlight: 'rgba(255, 255, 255, 0.72)',
    speakerColor: '#2A2A2E',
  },
};

export const BEZEL_FINISH_LIST: readonly BezelFinishConfig[] = [
  BEZEL_FINISHES.black,
  BEZEL_FINISHES.grey,
  BEZEL_FINISHES.silver,
];

function lerp(start: number, end: number, t: number): number {
  return Math.round(start + (end - start) * t);
}

function neutralRgb(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return `rgb(${clamped}, ${clamped}, ${clamped})`;
}

/**
 * Generates a strictly 100% neutral achromatic studio gradient (R === G === B)
 * smoothly interpolating from Dark Black (0) to Light Grey (100).
 */
export function getStudioBackgroundStyle(tone: number): {
  background: string;
  solidEdge: string;
  isLightSurface: boolean;
} {
  const t = Math.max(0, Math.min(100, tone)) / 100;

  const centerVal = lerp(24, 240, t);
  const midVal = lerp(14, 226, t);
  const edgeVal = lerp(7, 212, t);

  const center = neutralRgb(centerVal);
  const mid = neutralRgb(midVal);
  const edge = neutralRgb(edgeVal);

  return {
    background: `radial-gradient(ellipse 78% 72% at 50% 46%, ${center} 0%, ${mid} 54%, ${edge} 100%)`,
    solidEdge: edge,
    isLightSurface: tone >= 52,
  };
}

export type DeviceShadowVariant = 'phone' | 'window';

/**
 * Computes realistic grounded multi-layer drop shadows that adapt seamlessly
 * between dark obsidian and bright light-grey studio backdrops.
 */
export function getAdaptiveDeviceShadow(
  tone: number,
  bezel: BezelFinishId,
  variant: DeviceShadowVariant = 'phone',
  suppressShadow = false
): string {
  const t = Math.max(0, Math.min(100, tone)) / 100;

  if (suppressShadow) {
    return '';
  }

  const hairline =
    variant === 'window'
      ? `0 0 0 1px rgba(${t > 0.5 ? '0, 0, 0' : '255, 255, 255'}, ${(t > 0.5 ? 0.14 : 0.13).toFixed(3)})`
      : bezel === 'black'
        ? `0 0 0 1px rgba(255, 255, 255, ${(0.085 - t * 0.055).toFixed(3)})`
        : `0 0 0 1px rgba(${t > 0.5 ? '0, 0, 0' : '255, 255, 255'}, ${(0.12).toFixed(3)})`;

  const deepOpacity = (0.78 - t * 0.46).toFixed(3);
  const midOpacity = (0.55 - t * 0.34).toFixed(3);
  const contactOpacity = (0.5 - t * 0.32).toFixed(3);

  return [
    hairline,
    `0 12px 28px -8px rgba(0, 0, 0, ${contactOpacity})`,
    `0 32px 68px -16px rgba(0, 0, 0, ${midOpacity})`,
    `0 58px 110px -24px rgba(0, 0, 0, ${deepOpacity})`,
  ].join(', ');
}
