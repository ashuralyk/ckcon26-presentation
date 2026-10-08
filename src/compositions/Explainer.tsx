import React from "react";
import { Composition } from "remotion";
import { StickyBoard } from "../scenes/StickyBoard";

export const ExplainerComposition: React.FC = () => {
  return (
    <Composition
      id="Explainer"
      component={StickyBoard}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
