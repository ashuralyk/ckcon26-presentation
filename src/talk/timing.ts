export const FPS = 30;
/** Length of a one-step beat. Beats that have not been redesigned keep exactly this. */
export const BEAT_FRAMES = 90;

/**
 * Frames per step, per beat, laid out back to back on one timeline.
 * Step 0 plays on arrival together with the camera glide. Every step ends on a hold frame.
 * A beat with one entry behaves like the old one-click beat.
 */
export const STEPS: number[][] = [
  [70, 70], // 1  Title: the case file and one-line sentence settle and hold, then one click springs out the "why it exists" note
  [90, 70, 80], // 2  After RGB++: headline, curve + bull sticky, crowd + discovered sticky
  [90, 160, 100], // 3  But people go away: close-up + headline, crowd leaves (accelerating), because we were not ready
  [170, 75, 75, 75, 85, 80], // 4  Developer Journey Circle: headline + circle draws, Discover, Learn, Build, Success notes, pull back to all four
  [90, 100, 80], // 5  Learn: zoom on Learn + headline, doc pile + confused figure, sticky + BREAK stamp
  [90, 110, 80], // 6  Build: zoom on Build + headline, wall + figure + short ladder, sticky + crack
  [90, 160, 80], // 7  Success: zoom on Success + headline, road + flag + chasm, crowd stuck at the edge, few across; sticky + break
  [90, 110, 70, 70, 90, 110], // 8  Whole circle, red loops + "The problem lies on them.", DOCs sticky, SDKs sticky, "But in AI era", AI-friendly rewrite
  [90, 90, 150, 100], // 9  Most developers build with AI: headline, AI heart lands + beats, developers + vessels + pulses, catch-up poster
  [90, 80, 100], // 10 The gap is build: circle + headline, Build lights red + loop (others dim), gap sticky + onward arrow
  [90, 70, 70, 70, 80], // 11 Cinnabar: crate tagged CINNABAR, then one feature pops out per click (four)
  [90, 80, 80, 130, 80, 150, 90], // 12 Contracts own their calculators: seed card -> headline, contract + note, assembler + note, long GAP bridge, sticker, Cinnabar smashes the bridge + merge, close-up + Monorepo sticker
  [100, 140, 100, 120, 160], // 13 AI skills for non-coders (first person): 02 card -> headline + rock with the CKB Scripts crystal, iron digger fails, Cinnabar + AI skills cart, magic turns the digger gold, golden strike frees the crystal and a person holds it up
  [100, 80, 140, 90, 90, 110, 100], // 14 Inclusive verification tree: 03 card -> headline, Root, tree grows, green path, second green path, failed path + sticker, It's structural verification sticky
  [100, 90, 100, 110, 90], // 15 The first SSRI-integrated contract framework: 04 card -> headline, Contract + Calculators, Default path to GitHub, SSRI Switch On path to CKB chain, yellow sticky
  [100, 100, 130, 130], // 16 The meaning of Cinnabar: headline, raw rock + seal + small sticky, ghosts pushed back by the red glow, CKB card with ghosts kept outside + final sticky
  [100, 90], // 17 Thank you: headline alone, then the red 朱砂 seal stamps beside it
];

export const BEAT_COUNT = STEPS.length;

const LENGTHS = STEPS.map((steps) => steps.reduce((sum, n) => sum + n, 0));
const STARTS = LENGTHS.map((_, i) =>
  LENGTHS.slice(0, i).reduce((sum, n) => sum + n, 0),
);

export const TOTAL_FRAMES = LENGTHS.reduce((sum, n) => sum + n, 0);

export const beatLength = (index: number): number => LENGTHS[index] ?? 0;

export const beatStart = (index: number): number =>
  index >= BEAT_COUNT ? TOTAL_FRAMES : (STARTS[Math.max(0, index)] ?? 0);

export const beatEnd = (index: number): number =>
  beatStart(index) + beatLength(index) - 1;

export const beatOf = (frame: number): number => {
  let beat = 0;
  for (let i = 0; i < BEAT_COUNT; i++) {
    if (frame >= STARTS[i]) {
      beat = i;
    }
  }
  return beat;
};

/** First frame of a step inside a beat. */
export const stepStart = (beat: number, step: number): number =>
  beatStart(beat) +
  (STEPS[beat] ?? []).slice(0, step).reduce((sum, n) => sum + n, 0);

/** Step index inside the beat that is playing at this frame. */
export const stepOf = (frame: number): number => {
  const beat = beatOf(frame);
  let step = 0;
  (STEPS[beat] ?? []).forEach((_, i) => {
    if (frame >= stepStart(beat, i)) {
      step = i;
    }
  });
  return step;
};

/** Last frame of a step. The presenter pauses here until the next click. */
export const stepHold = (beat: number, step: number): number =>
  stepStart(beat, step) + (STEPS[beat]?.[step] ?? 0) - 1;

export type Stop = {beat: number; step: number; start: number; hold: number};

/** Every click stop in the talk, in order. */
export const STOPS: Stop[] = STEPS.flatMap((steps, beat) =>
  steps.map((_, step) => ({
    beat,
    step,
    start: stepStart(beat, step),
    hold: stepHold(beat, step),
  })),
);
