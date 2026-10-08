export const PAPER = "#F3F2EC";
export const GRID = "#E3E0D6";
export const INK = "#1A1A1A";
export const CINNABAR = "#D9381E";
export const STICKY = "#FCE865";
export const COBALT = "#2B4E8B";
export const CARD = "#F7F6F1";
export const FOLDER = "#E8E3D4";

export const SERIF =
  '"Playfair Display", "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif';
export const CJK = '"Noto Serif SC", "Songti SC", "STSong", "PMingLiU", serif';
export const SANS =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
export const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export type Cam = {x: number; y: number; scale: number};

export const CIRCLE = {
  discover: {x: 1160, y: 2860},
  learn: {x: 1880, y: 2860},
  build: {x: 1880, y: 3500},
  success: {x: 1160, y: 3500},
};

export const CAMERAS: Cam[] = [
  {x: 1100, y: 680, scale: 1},
  {x: 2480, y: 680, scale: 1},
  {x: 3960, y: 640, scale: 1},
  {x: 3960, y: 1720, scale: 1},
  {x: 2480, y: 1720, scale: 1},
  {x: 1520, y: 3180, scale: 0.62},
  {x: CIRCLE.learn.x, y: CIRCLE.learn.y, scale: 1.4},
  {x: 2060, y: CIRCLE.build.y, scale: 1.14},
  {x: CIRCLE.success.x, y: CIRCLE.success.y, scale: 1.36},
  {x: 3300, y: 3180, scale: 1},
  {x: 4560, y: 3180, scale: 1},
  {x: 1520, y: 3180, scale: 0.62},
  {x: 1520, y: 4900, scale: 1},
  {x: 1520, y: 6400, scale: 0.7},
  {x: 4380, y: 6400, scale: 1},
  {x: 1520, y: 8000, scale: 0.86},
  {x: 3180, y: 8000, scale: 1},
  {x: 1520, y: 4900, scale: 1},
  {x: 1520, y: 4900, scale: 1.48},
];

export type BeatCopy = {
  title: string;
  titleSize: number;
  sub?: string;
  subRed?: boolean;
};

export const COPY: BeatCopy[] = [
  {title: "Cinnabar.", titleSize: 116, sub: "Why it exists."},
  {title: "After RGB++.", titleSize: 100},
  {title: "The strongest bull market.", titleSize: 78},
  {title: "They discovered CKB.", titleSize: 88},
  {title: "We weren't ready.", titleSize: 96},
  {title: "Discover. Learn. Build. Success.", titleSize: 64},
  {title: "Learn: no efficient docs.", titleSize: 76},
  {title: "Build: the threshold was too high.", titleSize: 64},
  {title: "Success never started.", titleSize: 80},
  {
    title: "We have learned.",
    titleSize: 90,
    sub: "Not ready for learn and build. Building harder now.",
  },
  {
    title: "Most developers build with AI.",
    titleSize: 68,
    sub: "So do we. We have to catch up.",
  },
  {title: "The gap is build.", titleSize: 96},
  {
    title: "Cinnabar.",
    titleSize: 108,
    sub: "An AI-friendly CKB script programming tool.",
  },
  {title: "01 Contracts own their calculators.", titleSize: 60},
  {title: "02 AI skills. No coding needed.", titleSize: 68},
  {title: "03 An inclusive verification tree.", titleSize: 64},
  {title: "04 The first SSRI contract framework.", titleSize: 58},
  {
    title: "Building harder, for the next bull market.",
    titleSize: 60,
    sub: "Cinnabar fills build.",
    subRed: true,
  },
  {title: "", titleSize: 28},
];
