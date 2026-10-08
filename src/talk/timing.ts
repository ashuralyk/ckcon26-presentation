export const FPS = 30;
export const BEAT_FRAMES = 90;
export const BEAT_COUNT = 19;
export const TOTAL_FRAMES = BEAT_FRAMES * BEAT_COUNT;

export const beatOf = (frame: number): number =>
  Math.max(0, Math.min(BEAT_COUNT - 1, Math.floor(frame / BEAT_FRAMES)));

export const beatStart = (index: number): number => index * BEAT_FRAMES;

export const beatEnd = (index: number): number =>
  beatStart(index) + BEAT_FRAMES - 1;
