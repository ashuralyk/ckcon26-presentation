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
  {x: 2610, y: 900, scale: 1.9},
  {x: 1520, y: 3150, scale: 0.7},
  {x: 2060, y: 2840, scale: 1.25}, // Learn card with room for the doc pile on its right
  {x: 1900, y: 3440, scale: 1.2}, // Build card, wall on its right, Build -> Success arc below
  {x: 1075, y: 3440, scale: 1.25}, // Success card, road below-left, Success -> Discover arc on the left
  {x: 1660, y: 3180, scale: 0.8}, // Whole clean circle, room on the right for the two needs stickies
  {x: 4560, y: 3180, scale: 1},
  {x: 1520, y: 3180, scale: 0.62},
  {x: 3400, y: 4900, scale: 1}, // Cinnabar crate (right of the old tool folder) with room for four feature cards
  {x: 1500, y: 6400, scale: 0.62}, // Wide: contract far left, client assembler far right, the long GAP bridge between
  {x: 4400, y: 6380, scale: 0.9}, // Beat 13: world spot for the 02 card -> headline; the high-jump stage is a screen-space layer (JumpView)
  {x: 1520, y: 8000, scale: 0.86}, // Inclusive verification tree: root + branches around the lower centre
  {x: 3300, y: 8040, scale: 1}, // Beat 15: scaffold framework left of centre, room on the right for the FIRST stamp and the sticky
  {x: 3300, y: 9400, scale: 1}, // Beat 16: an empty stretch of desk below the page 15 framework; world = screen + (2340, 8860)
  {x: 3300, y: 10600, scale: 1}, // Beat 17: clean desk below page 16; world = screen + (2340, 10060)
];

/**
 * Optional per-step camera targets. A beat listed here glides to each step's target at that step's start.
 * Beats not listed keep one target (CAMERAS) for all their steps.
 */
export const STEP_CAMERAS: Partial<Record<number, Cam[]>> = {
  13: [
    CAMERAS[13],
    {x: 1580, y: 8110, scale: 1.25}, // Close on the lone Root card
    {x: 1500, y: 7960, scale: 0.92}, // Ease out: the whole tree fits
    {x: 1500, y: 7960, scale: 0.92},
    {x: 1500, y: 7960, scale: 0.92},
    {x: 1500, y: 7960, scale: 0.92},
    {x: 1520, y: 7950, scale: 0.96}, // Gentle push for the sticky
  ],
  3: [
    CAMERAS[3],
    {x: 940, y: 2880, scale: 1.15}, // Discover
    {x: 2100, y: 2880, scale: 1.15}, // Learn
    {x: 2100, y: 3480, scale: 1.15}, // Build
    {x: 940, y: 3480, scale: 1.15}, // Success
    {x: 1530, y: 3110, scale: 0.8}, // Pull back: all four cards and notes
  ],
  11: [
    CAMERAS[11],
    CAMERAS[11],
    CAMERAS[11],
    CAMERAS[11],
    CAMERAS[11],
    CAMERAS[11],
    {x: 1640, y: 6400, scale: 1.1}, // Close on the merged unit, its loop and the Monorepo tag on the lower right
  ],
  10: [
    {x: 3490, y: 5040, scale: 1.15}, // Closer on the crate
    CAMERAS[10],
    CAMERAS[10],
    CAMERAS[10],
    CAMERAS[10],
  ],
  9: [
    CAMERAS[9], // Whole quiet circle
    {x: 2260, y: 3460, scale: 1.4}, // Close-up on Build, room on its right for the Cinnabar card
    {x: 2260, y: 3460, scale: 1.4},
  ],
};

export type BeatCopy = {
  title: string;
  titleSize: number;
  sub?: string;
  subRed?: boolean;
};

export const COPY: BeatCopy[] = [
  {title: "Cinnabar.", titleSize: 116},
  {title: "After RGB++.", titleSize: 100},
  {title: "But people go away.", titleSize: 92},
  {title: "Developer Journey Circle", titleSize: 84},
  {title: "Learn: no efficient docs.", titleSize: 76},
  {title: "Build: the threshold was too high.", titleSize: 64},
  {title: "Success: it's hard to reach", titleSize: 72},
  {title: "", titleSize: 28}, // Beat 8 has no running headline; "But in AI era" is its own layer (AiEra)
  {title: "Most developers build with AI.", titleSize: 68},
  {title: "The gap is build.", titleSize: 96},
  {
    title: "Cinnabar.",
    titleSize: 108,
    sub: "An AI-friendly CKB script programming tool.",
  },
  {title: "Contracts own their calculators", titleSize: 72},
  {title: "AI skills for non-coders", titleSize: 76},
  {title: "Inclusive verification tree", titleSize: 72},
  {title: "The first SSRI-integrated contract framework", titleSize: 58},
  {title: "The meaning of Cinnabar", titleSize: 76},
  {title: "Thank you.", titleSize: 260},
];
