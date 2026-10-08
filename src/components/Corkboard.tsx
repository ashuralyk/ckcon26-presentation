import React from "react";
import { AbsoluteFill } from "remotion";

/** Soft cork + grid backdrop — swap colors/texture as your brand settles. */
export const Corkboard: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#c4a574",
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(0,0,0,0.08), transparent 45%),
          linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "auto, auto, 48px 48px, 48px 48px",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
