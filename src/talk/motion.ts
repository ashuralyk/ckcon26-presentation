import {Easing, interpolate, spring} from "remotion";
import {CAMERAS, STEP_CAMERAS, type Cam} from "./stage";
import {beatOf, stepOf, stepStart} from "./timing";

const GLIDE_FRAMES = 32;

export const glide = (local: number): number =>
  interpolate(local, [0, GLIDE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

const stopCam = (beat: number, step: number): Cam =>
  STEP_CAMERAS[beat]?.[step] ?? CAMERAS[beat];

const lastCam = (beat: number): Cam => {
  const list = STEP_CAMERAS[beat];
  return list ? list[list.length - 1] : CAMERAS[beat];
};

/** Glides at every step start toward that step's target; a no-op when the target does not change. */
export const cameraAt = (frame: number): Cam => {
  const beat = beatOf(frame);
  const step = stepOf(frame);
  const to = stopCam(beat, step);
  if (beat === 0 && step === 0) {
    return to;
  }
  const from = step > 0 ? stopCam(beat, step - 1) : lastCam(beat - 1);
  const t = glide(frame - stepStart(beat, step));
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    scale: from.scale + (to.scale - from.scale) * t,
  };
};

export const enter = (
  frame: number,
  fps: number,
  at: number,
  delay = 0,
): number =>
  spring({
    frame: frame - at - delay,
    fps,
    config: {damping: 14, stiffness: 120, mass: 0.7},
  });

export const slam = (
  frame: number,
  fps: number,
  at: number,
  delay: number,
): number =>
  spring({
    frame: frame - at - delay,
    fps,
    config: {damping: 8, stiffness: 210, mass: 0.55},
  });

export const reveal = (
  frame: number,
  fps: number,
  at: number,
  delay = 0,
): number =>
  spring({
    frame: frame - at - delay,
    fps,
    config: {damping: 20, stiffness: 70, mass: 0.9},
  });

export const linear = (
  frame: number,
  start: number,
  end: number,
  from = 0,
  to = 1,
): number =>
  interpolate(frame, [start, end], [from, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const eased = (frame: number, start: number, end: number): number =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
