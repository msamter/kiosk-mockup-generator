export type BezelFinishId = 'black' | 'grey' | 'silver';
export type StudioThemeId = 'grid' | 'angles' | 'charisma' | 'terminal' | 'scribe' | 'hourglass';
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
export type CharismaSceneId =
  | 'duo'
  | 'fan'
  | 'deck'
  | 'stack'
  | 'sway'
  | 'wave'
  | 'peak';
export type TerminalSceneId = 'desktop' | 'macbook' | 'ultrawide' | 'browser';
export type ScribeSceneId =
  | 'tablet-1'
  | 'tablet-2'
  | 'tablet-mini'
  | 'tablet-pro'
  | 'tablet-wide'
  | 'tablet-pair';
export type HourglassSceneId = 'watch-1' | 'watch-3' | 'watch-6';
export type StudioPageId =
  | GridSceneId
  | AngleSceneId
  | CharismaSceneId
  | TerminalSceneId
  | ScribeSceneId
  | HourglassSceneId;

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
  'deck',
  'stack',
  'sway',
  'wave',
  'peak',
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
  'watch-6',
] as const;

export const SCENE_FRAME_COUNTS: readonly StudioPageId[] = [
  ...GRID_SCENES,
  ...ANGLE_SCENES,
  ...CHARISMA_SCENES,
  ...TERMINAL_SCENES,
  ...SCRIBE_SCENES,
  ...HOURGLASS_SCENES,
] as const;

export const THEME_SCENES: Record<StudioThemeId, readonly StudioPageId[]> = {
  grid: GRID_SCENES,
  angles: ANGLE_SCENES,
  charisma: CHARISMA_SCENES,
  terminal: TERMINAL_SCENES,
  scribe: SCRIBE_SCENES,
  hourglass: HOURGLASS_SCENES,
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
    label: 'Charisma',
    description: '7 signature layouts',
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
    description: '3 Pixel Watch layouts',
  },
] as const;

const ANGLE_SCENE_SET = new Set<string>(ANGLE_SCENES);
const CHARISMA_SCENE_SET = new Set<string>(CHARISMA_SCENES);
const TERMINAL_SCENE_SET = new Set<string>(TERMINAL_SCENES);
const SCRIBE_SCENE_SET = new Set<string>(SCRIBE_SCENES);
const HOURGLASS_SCENE_SET = new Set<string>(HOURGLASS_SCENES);

export function isAngleScene(scene: StudioPageId): scene is AngleSceneId {
  return typeof scene === 'string' && ANGLE_SCENE_SET.has(scene);
}

export function isCharismaScene(scene: StudioPageId): scene is CharismaSceneId {
  return typeof scene === 'string' && CHARISMA_SCENE_SET.has(scene);
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

export function isGridScene(scene: StudioPageId): scene is GridSceneId {
  return typeof scene === 'number';
}

export function getThemeForScene(scene: StudioPageId): StudioThemeId {
  if (isAngleScene(scene)) return 'angles';
  if (isCharismaScene(scene)) return 'charisma';
  if (isTerminalScene(scene)) return 'terminal';
  if (isScribeScene(scene)) return 'scribe';
  if (isHourglassScene(scene)) return 'hourglass';
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
  peek: 'Peek',
  offset: 'Offset',
  cascade: 'Cascade',
  quad: 'Quad',
  masonry: 'Masonry',
  'tilt-right': 'Tilt R',
  'tilt-left': 'Tilt L',
  duo: 'Duo',
  fan: 'Fan',
  deck: 'Deck',
  slant: 'Slant',
  stack: 'Stack',
  sway: 'Sway',
  wave: 'Wave',
  peak: 'Peak',
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
  'watch-6': '6',
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
  deck: 3,
  slant: 2,
  stack: 4,
  sway: 4,
  wave: 4,
  peak: 4,
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
  'watch-6': 6,
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
  readonly items: readonly CharismaFrameItem[];
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
  deck: {
    itemGapPx: -64,
    items: [
      { frame: 1, offsetY: -26, rotateDeg: -6, zIndex: 30 },
      { frame: 2, offsetY: -6, rotateDeg: 7, zIndex: 20 },
      { frame: 3, offsetY: 42, rotateDeg: 7, zIndex: 10 },
    ],
  },
  stack: {
    itemGapPx: -62,
    items: [
      { frame: 1, offsetY: -84, rotateDeg: 0, zIndex: 40 },
      { frame: 2, offsetY: 16, rotateDeg: 0, zIndex: 30 },
      { frame: 3, offsetY: -16, rotateDeg: 0, zIndex: 20 },
      { frame: 4, offsetY: 84, rotateDeg: 0, zIndex: 10 },
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
  wave: {
    itemGapPx: 56,
    items: [
      { frame: 1, offsetY: -64, rotateDeg: 0, zIndex: 10 },
      { frame: 2, offsetY: 64, rotateDeg: 0, zIndex: 10 },
      { frame: 3, offsetY: -64, rotateDeg: 0, zIndex: 10 },
      { frame: 4, offsetY: 64, rotateDeg: 0, zIndex: 10 },
    ],
  },
  peak: {
    itemGapPx: 56,
    items: [
      { frame: 1, offsetY: 0, rotateDeg: 0, zIndex: 10 },
      { frame: 2, offsetY: -152, rotateDeg: 0, zIndex: 10 },
      { frame: 3, offsetY: 36, rotateDeg: 0, zIndex: 10 },
      { frame: 4, offsetY: 156, rotateDeg: 0, zIndex: 10 },
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

export interface HourglassSceneLayoutConfig {
  readonly containerClass: string;
  readonly screenDiameterPx: number;
  readonly bezelPadPx: number;
  readonly showStraps: boolean;
  readonly strapLengthPx: number;
  readonly frames: readonly number[];
}

export const HOURGLASS_SCENE_LAYOUTS: Record<HourglassSceneId, HourglassSceneLayoutConfig> = {
  'watch-1': {
    containerClass: 'flex items-center justify-center',
    screenDiameterPx: 460,
    bezelPadPx: 20,
    showStraps: true,
    strapLengthPx: 146,
    frames: [1],
  },
  'watch-3': {
    containerClass: 'flex flex-row items-center justify-center gap-12',
    screenDiameterPx: 360,
    bezelPadPx: 17,
    showStraps: true,
    strapLengthPx: 112,
    frames: [1, 2, 3],
  },
  'watch-6': {
    containerClass: 'grid grid-cols-[repeat(3,max-content)] gap-8 items-center justify-items-center',
    screenDiameterPx: 340,
    bezelPadPx: 16,
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
  deck: [1, 2, 3],
  slant: [1, 2],
  stack: [1, 2, 3, 4],
  sway: [1, 2, 3, 4],
  wave: [1, 2, 3, 4],
  peak: [1, 2, 3, 4],
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
  'watch-6': [1, 2, 3, 4, 5, 6],
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
  peek: 'Peek single hero bottom-crop showcase',
  offset: 'Offset 2-screen staggered split showcase',
  cascade: 'Cascade 3-screen descending staircase showcase',
  quad: 'Quad 4-screen 26-degree angled showcase',
  masonry: 'Masonry 4-column staggered showcase wall',
  'tilt-right': 'Tilt Right 45-degree clockwise brick mosaic',
  'tilt-left': 'Tilt Left 45-degree counter-clockwise brick mosaic',
  duo: 'Duo 2-screen opposing V-fan showcase',
  fan: 'Fan 3-screen radiating spread showcase',
  deck: 'Deck 3-screen layered card-fan showcase',
  slant: 'Slant 2-screen parallel tilted showcase',
  stack: 'Stack 4-screen overlapping stepped showcase',
  sway: 'Sway 4-screen alternating tilt ribbon showcase',
  wave: 'Wave 4-screen alternating high-low showcase',
  peak: 'Peak 4-screen elevated hero cascade showcase',
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
  'watch-6': '6 Pixel Watch screens close-knit 2 by 3 grid showcase',
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
  deck: 'flex items-center justify-center',
  slant: 'flex items-center justify-center',
  stack: 'flex items-center justify-center',
  sway: 'flex items-center justify-center',
  wave: 'flex items-center justify-center',
  peak: 'flex items-center justify-center',
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
  'watch-6': 'flex items-center justify-center',
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
