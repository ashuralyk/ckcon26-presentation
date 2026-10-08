import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type StickyNoteProps = {
  title: string;
  body: string;
  /** CSS color for the paper */
  color?: string;
  /** Delay before the note springs in (frames) */
  delay?: number;
  /** Position of the note on the board */
  style?: React.CSSProperties;
  /** Slight rotation in degrees for a hand-placed look */
  rotate?: number;
};

export const StickyNote: React.FC<StickyNoteProps> = ({
  title,
  body,
  color = "#fff7a8",
  delay = 0,
  style,
  rotate = -2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.7 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(progress, [0, 1], [0.85, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        width: 280,
        minHeight: 220,
        padding: "28px 24px 32px",
        backgroundColor: color,
        boxShadow: "0 10px 28px rgba(0,0,0,0.22), 0 2px 0 rgba(0,0,0,0.06)",
        transform: `translateY(${y}px) scale(${scale}) rotate(${rotate}deg)`,
        opacity,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        ...style,
      }}
    >
      {/* Tape strip */}
      <div
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          width: 72,
          height: 18,
          marginLeft: -36,
          backgroundColor: "rgba(255,255,255,0.55)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
          transform: "rotate(-1deg)",
        }}
      />
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#1a1a1a",
          marginBottom: 12,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 16, lineHeight: 1.45, color: "#333" }}>{body}</div>
    </div>
  );
};

/** Full-frame helper when you want a note centered for testing. */
export const CenteredSticky: React.FC<Omit<StickyNoteProps, "style">> = (
  props,
) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StickyNote {...props} style={{ position: "relative" }} />
    </AbsoluteFill>
  );
};
