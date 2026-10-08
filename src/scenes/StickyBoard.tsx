import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Corkboard } from "../components/Corkboard";
import { StickyNote } from "../components/StickyNote";

/**
 * Starter scene: three sticky notes spring onto a corkboard.
 * Duplicate notes, change copy, or Sequence in more beats as you write chapters.
 */
export const StickyBoard: React.FC = () => {
  return (
    <Corkboard>
      <AbsoluteFill>
        <StickyNote
          title="Claim"
          body="AI building AI changes the race from human research speed to compute flywheels."
          color="#fff7a8"
          delay={8}
          rotate={-3}
          style={{ left: 80, top: 120 }}
        />
        <StickyNote
          title="Evidence"
          body="Frontier labs hide chain-of-thought; distillation gets harder; GPUs become the scarce resource."
          color="#c8f0ff"
          delay={22}
          rotate={2}
          style={{ left: 500, top: 160 }}
        />
        <StickyNote
          title="So what?"
          body="A short delay can compound. Your next scene should answer: who can keep iterating?"
          color="#ffd6e0"
          delay={36}
          rotate={-1}
          style={{ left: 900, top: 240 }}
        />

        {/* Title card after notes settle */}
        <Sequence from={55}>
          <div
            style={{
              position: "absolute",
              left: 80,
              bottom: 64,
              padding: "16px 22px",
              backgroundColor: "rgba(20,16,12,0.88)",
              color: "#f8f4ec",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              borderRadius: 8,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
            }}
          >
            Edit src/scenes/StickyBoard.tsx → build your chapter
          </div>
        </Sequence>
      </AbsoluteFill>
    </Corkboard>
  );
};
