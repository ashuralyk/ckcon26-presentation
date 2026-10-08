import {Easing, interpolate, spring} from "remotion";
import {CAMERAS, type Cam} from "./stage";
import {beatOf, beatStart} from "./timing";

const GLIDE_FRAMES = 32;

export const glide = (local: number): number =>
  interpolate(local, [0, GLIDE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

export const cameraAt = (frame: number): Cam => {
  const beat = beatOf(frame);
  const to = CAMERAS[beat];
  if (beat === 0) {
    return to;
  }
  const from = CAMERAS[beat - 1];
  const t = glide(frame - beatStart(beat));
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
